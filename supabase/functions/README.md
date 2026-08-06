# Supabase Edge Functions — Laurie's Love

Deno + TypeScript functions. All secrets are read via `Deno.env.get(...)`. If a
required secret is missing, the function returns a **503 `not_configured`** JSON
response (it never crashes), so the app can call these safely *before* the client
supplies API keys.

Shared helpers live in `_shared/`:
- `cors.ts` — CORS headers, `json()`, `notConfigured()`, `handlePreflight()`
- `supabaseAdmin.ts` — `adminClient()` (service role), `getUser()` (JWT), `missingEnv()`, `env()`

Supabase auto-injects `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and
`SUPABASE_SERVICE_ROLE_KEY` at runtime — you do **not** set those manually.

---

## Functions & required secrets

| Function | Purpose | Secrets it needs |
|---|---|---|
| `stripe-create-checkout-session` | Creates a Stripe Checkout Session (one-time or recurring), records a pending `payments` row, returns `{ url }`. | `STRIPE_SECRET_KEY`, `APP_URL` *(+ auto SUPABASE_*)* |
| `stripe-webhook` | Verifies Stripe signature; reconciles `payments` + `donation_subscriptions`; idempotent on event id. **Deploy with `--no-verify-jwt`.** | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` *(+ auto SUPABASE_*)* |
| `send-email` | SendGrid v3 transactional email. Templates: `welcome`, `password_reset`, `generic`. | `SENDGRID_API_KEY` *(optional: `SENDGRID_FROM_EMAIL`, `SENDGRID_FROM_NAME`, `APP_URL`)* |
| `send-push` | Expo push (default) + optional FCM. Reads tokens from `profiles_private.push_token` where `push_active`. Batched fan-out. | *(auto SUPABASE_*; optional `FCM_SERVER_KEY`)* |
| `moderate-content` | OpenAI moderation. On flag, inserts into `moderation_queue` (`flagged_by='ai'`). Replaces the keyword-heuristic DB trigger. | `OPENAI_API_KEY` *(optional: `OPENAI_MODERATION_MODEL`) (+ auto SUPABASE_*)* |

### Full secret list
`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `APP_URL`, `SENDGRID_API_KEY`,
`FCM_SERVER_KEY`, `OPENAI_API_KEY`, plus the auto-injected `SUPABASE_URL`,
`SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

---

## Request shapes

**stripe-create-checkout-session** (auth required)
```json
{ "amount": 25, "mode": "one_time" }
{ "amount": 10, "mode": "recurring", "interval": "month", "in_honor_name": "Laurie" }
```
→ `{ "url": "https://checkout.stripe.com/...", "payment_id": "..." }`

**send-email**
```json
{ "to": "user@example.com", "template": "password_reset",
  "data": { "first_name": "Sam", "reset_link": "https://app.../reset?token=..." } }
```

**send-push**
```json
{ "userIds": ["<profile-uuid>"], "title": "New message", "body": "You have a reply", "data": { "type": "NEW_MESSAGE" } }
```

**moderate-content**
```json
{ "entity_type": "post", "entity_id": "<post-uuid>", "text": "the post body" }
```
→ `{ "flagged": false, "categories": {}, "score": 0.01 }`

---

## Deploy (run later, once keys exist)

```bash
# Deploy each function
supabase functions deploy stripe-create-checkout-session
supabase functions deploy stripe-webhook --no-verify-jwt   # Stripe calls this, no JWT
supabase functions deploy send-email
supabase functions deploy send-push
supabase functions deploy moderate-content
```

## Set secrets (run later, once keys exist)

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
supabase secrets set APP_URL=https://app.laurieslove.org
supabase secrets set SENDGRID_API_KEY=SG.xxx
supabase secrets set SENDGRID_FROM_EMAIL=no-reply@laurieslove.org
supabase secrets set SENDGRID_FROM_NAME="Laurie's Love"
supabase secrets set FCM_SERVER_KEY=xxx          # optional — only for raw FCM tokens
supabase secrets set OPENAI_API_KEY=sk-xxx
# SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY are auto-injected.
```

## Stripe webhook setup
Point a Stripe webhook endpoint at:
`https://<project-ref>.functions.supabase.co/stripe-webhook`
subscribed to: `checkout.session.completed`, `invoice.paid`,
`customer.subscription.updated`, `customer.subscription.deleted`.
Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

## Migration
`supabase/migrations/20260806120200_payments_stripe_v1.sql` adds
`donation_subscriptions`, the Stripe columns on `payments`, and
`processed_stripe_events` (webhook idempotency). Apply with `supabase db push`.
