// stripe-webhook
// Verifies the Stripe signature and reconciles payments + subscriptions.
// Handles: checkout.session.completed, invoice.paid,
//          customer.subscription.updated, customer.subscription.deleted.
// Idempotent on Stripe event id via `processed_stripe_events`.
//
// Required secrets: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
//                   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//
// NOTE: This function must be deployed with JWT verification DISABLED
//       (`supabase functions deploy stripe-webhook --no-verify-jwt`) because
//       Stripe calls it directly with no Supabase session. Security comes from
//       the Stripe signature check below, not from a JWT.
import Stripe from 'https://esm.sh/stripe@16.12.0?target=deno';
import { json, notConfigured } from '../_shared/cors.ts';
import { adminClient, missingEnv } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return json({ error: 'method not allowed' }, 405);
  }

  const missing = missingEnv([
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
  ]);
  if (missing.length) return notConfigured(missing);

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
    apiVersion: '2024-06-20',
    httpClient: Stripe.createFetchHttpClient(),
  });

  const signature = req.headers.get('stripe-signature');
  if (!signature) return json({ error: 'missing stripe-signature' }, 400);

  // Signature verification requires the RAW request body.
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!,
      undefined,
      Stripe.createSubtleCryptoProvider(),
    );
  } catch (e) {
    return json({ error: `signature verification failed: ${(e as Error).message}` }, 400);
  }

  const admin = adminClient();

  // Idempotency: claim the event id. If it's already present, we've handled it.
  const { error: claimErr } = await admin
    .from('processed_stripe_events')
    .insert({ event_id: event.id });
  if (claimErr) {
    // Unique-violation => already processed. Ack with 200 so Stripe stops retrying.
    if ((claimErr as { code?: string }).code === '23505') {
      return json({ received: true, duplicate: true });
    }
    // Any other DB error: 500 so Stripe retries later.
    return json({ error: claimErr.message }, 500);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const s = event.data.object as Stripe.Checkout.Session;
        const paymentId = s.metadata?.payment_id ?? s.client_reference_id ?? null;

        const patch: Record<string, unknown> = {
          status: 'completed',
          stripe_session_id: s.id,
        };
        if (s.payment_intent) {
          patch.stripe_payment_intent_id = typeof s.payment_intent === 'string'
            ? s.payment_intent
            : s.payment_intent.id;
          patch.processor_ref = patch.stripe_payment_intent_id;
        }
        if (s.subscription) {
          patch.stripe_subscription_id = typeof s.subscription === 'string'
            ? s.subscription
            : s.subscription.id;
        }

        if (paymentId) {
          await admin.from('payments').update(patch).eq('id', paymentId);
        } else if (s.id) {
          await admin.from('payments').update(patch).eq('stripe_session_id', s.id);
        }

        // For subscriptions, upsert the donation_subscriptions record.
        if (s.subscription && s.mode === 'subscription') {
          await upsertSubscription(admin, stripe, {
            subscriptionId: typeof s.subscription === 'string'
              ? s.subscription
              : s.subscription.id,
            customerId: typeof s.customer === 'string'
              ? s.customer
              : s.customer?.id ?? null,
            profileId: s.metadata?.profile_id ?? null,
          });
        }
        break;
      }

      case 'invoice.paid': {
        const inv = event.data.object as Stripe.Invoice;
        const subId = typeof inv.subscription === 'string'
          ? inv.subscription
          : inv.subscription?.id ?? null;
        if (subId) {
          await upsertSubscription(admin, stripe, {
            subscriptionId: subId,
            customerId: typeof inv.customer === 'string'
              ? inv.customer
              : inv.customer?.id ?? null,
            profileId: null,
          });
          // Record each recurring charge as its own completed payment row,
          // keyed off the subscription owner if we can resolve them.
          await recordInvoicePayment(admin, inv, subId);
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await upsertSubscription(admin, stripe, {
          subscriptionId: sub.id,
          customerId: typeof sub.customer === 'string' ? sub.customer : sub.customer?.id ?? null,
          profileId: (sub.metadata?.profile_id as string) ?? null,
          subObject: sub,
        });
        break;
      }

      default:
        // Unhandled event types are acknowledged so Stripe stops retrying.
        break;
    }

    return json({ received: true });
  } catch (e) {
    // Roll back the idempotency claim so a transient failure can be retried.
    await admin.from('processed_stripe_events').delete().eq('event_id', event.id);
    return json({ error: (e as Error).message ?? 'webhook handler failed' }, 500);
  }
});

// Upserts a donation_subscriptions row from a Stripe subscription.
async function upsertSubscription(
  admin: ReturnType<typeof adminClient>,
  stripe: Stripe,
  args: {
    subscriptionId: string;
    customerId: string | null;
    profileId: string | null;
    subObject?: Stripe.Subscription;
  },
) {
  const sub = args.subObject ?? (await stripe.subscriptions.retrieve(args.subscriptionId));
  const item = sub.items?.data?.[0];
  const price = item?.price;

  // Resolve the profile: prefer metadata, else look up by stripe_customer_id.
  let profileId = args.profileId ?? (sub.metadata?.profile_id as string | undefined) ?? null;
  if (!profileId && args.customerId) {
    const { data } = await admin
      .from('donation_subscriptions')
      .select('profile_id')
      .eq('stripe_customer_id', args.customerId)
      .limit(1)
      .maybeSingle();
    profileId = data?.profile_id ?? null;
  }

  const row: Record<string, unknown> = {
    stripe_subscription_id: sub.id,
    stripe_customer_id: args.customerId,
    status: sub.status,
    interval: price?.recurring?.interval ?? null,
    amount_cents: price?.unit_amount ?? null,
    currency: (price?.currency ?? 'usd').toUpperCase(),
    current_period_end: sub.current_period_end
      ? new Date(sub.current_period_end * 1000).toISOString()
      : null,
  };
  if (profileId) row.profile_id = profileId;

  await admin
    .from('donation_subscriptions')
    .upsert(row, { onConflict: 'stripe_subscription_id' });
}

// Records a completed payment row for a paid subscription invoice.
async function recordInvoicePayment(
  admin: ReturnType<typeof adminClient>,
  inv: Stripe.Invoice,
  subId: string,
) {
  // Find the subscription owner so the payment is attributed correctly.
  const { data: subRow } = await admin
    .from('donation_subscriptions')
    .select('profile_id')
    .eq('stripe_subscription_id', subId)
    .maybeSingle();
  if (!subRow?.profile_id) return;

  const piId = typeof inv.payment_intent === 'string'
    ? inv.payment_intent
    : inv.payment_intent?.id ?? null;

  // Guard against duplicate rows if the same invoice fires twice.
  if (piId) {
    const { data: existing } = await admin
      .from('payments')
      .select('id')
      .eq('stripe_payment_intent_id', piId)
      .maybeSingle();
    if (existing) return;
  }

  await admin.from('payments').insert({
    profile_id: subRow.profile_id,
    amount: (inv.amount_paid ?? 0) / 100,
    currency: (inv.currency ?? 'usd').toUpperCase(),
    payment_type: 'RECURRING',
    status: 'completed',
    processor: 'stripe',
    provider: 'stripe',
    processor_ref: piId,
    stripe_payment_intent_id: piId,
    stripe_subscription_id: subId,
  });
}
