// stripe-create-checkout-session
// Body: { amount: number (dollars), mode: 'one_time' | 'recurring',
//         interval?: 'month' | 'year', in_honor_name?: string }
// Creates a Stripe Checkout Session and records a pending row in `payments`.
// Returns { url } for the client to redirect to.
//
// Required secrets: STRIPE_SECRET_KEY, APP_URL,
//                   SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
import Stripe from 'https://esm.sh/stripe@16.12.0?target=deno';
import { handlePreflight, json, notConfigured } from '../_shared/cors.ts';
import { adminClient, env, getUser, missingEnv } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  if (req.method !== 'POST') {
    return json({ error: 'method not allowed' }, 405);
  }

  // Env seam: bail cleanly with a 503 if the client hasn't supplied keys yet.
  const missing = missingEnv([
    'STRIPE_SECRET_KEY',
    'APP_URL',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
  ]);
  if (missing.length) return notConfigured(missing);

  try {
    // Identify the caller from their JWT so we can attribute the payment.
    const user = await getUser(req);
    if (!user) return json({ error: 'invalid token' }, 401);

    const body = await req.json().catch(() => ({}));
    const amount = Number(body.amount);
    const mode: string = body.mode;
    const interval: 'month' | 'year' = body.interval === 'year' ? 'year' : 'month';
    const inHonorName: string | null = body.in_honor_name ?? null;

    if (!Number.isFinite(amount) || amount <= 0) {
      return json({ error: 'amount must be a positive number' }, 400);
    }
    if (mode !== 'one_time' && mode !== 'recurring') {
      return json({ error: "mode must be 'one_time' or 'recurring'" }, 400);
    }

    const amountCents = Math.round(amount * 100);
    const currency = (body.currency ?? 'usd').toString().toLowerCase();
    const appUrl = env('APP_URL')!.replace(/\/$/, '');

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2024-06-20',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Record the pending payment FIRST so the webhook can reconcile by our id.
    const admin = adminClient();
    const { data: payment, error: payErr } = await admin
      .from('payments')
      .insert({
        profile_id: user.id,
        amount: amount,
        currency: currency.toUpperCase(),
        payment_type: mode === 'one_time' ? 'ONE_TIME' : 'RECURRING',
        status: 'pending',
        processor: 'stripe',
        provider: 'stripe',
        in_honor_name: inHonorName,
      })
      .select('id')
      .single();
    if (payErr) throw payErr;

    // Line item: for subscriptions Stripe needs a recurring price definition;
    // for one-time we pass a flat amount. price_data avoids pre-creating prices.
    const lineItem = mode === 'one_time'
      ? {
        price_data: {
          currency,
          product_data: { name: "Laurie's Love Donation" },
          unit_amount: amountCents,
        },
        quantity: 1,
      }
      : {
        price_data: {
          currency,
          product_data: { name: "Laurie's Love Recurring Donation" },
          unit_amount: amountCents,
          recurring: { interval },
        },
        quantity: 1,
      };

    const session = await stripe.checkout.sessions.create({
      mode: mode === 'one_time' ? 'payment' : 'subscription',
      line_items: [lineItem],
      customer_email: user.email,
      success_url: `${appUrl}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/donate/cancel`,
      // Metadata is echoed back on webhook events so we can reconcile.
      metadata: {
        payment_id: payment.id,
        profile_id: user.id,
        in_honor_name: inHonorName ?? '',
      },
      client_reference_id: payment.id,
    });

    // Persist the session id so the webhook can match completed sessions.
    await admin
      .from('payments')
      .update({ stripe_session_id: session.id })
      .eq('id', payment.id);

    return json({ url: session.url, payment_id: payment.id });
  } catch (e) {
    return json({ error: (e as Error).message ?? 'checkout failed' }, 500);
  }
});
