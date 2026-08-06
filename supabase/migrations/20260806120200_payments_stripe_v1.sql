-- ============================================================
-- Stripe payments v1  (additive, idempotent)
-- ============================================================
-- Adds recurring-donation support (donation_subscriptions), Stripe reconciliation
-- columns on the existing payments table, and a webhook idempotency table.
-- Nothing is dropped or renamed. The existing authorize_net payment path
-- (payments.processor default 'authorize_net') is left fully intact; Stripe rows
-- set processor='stripe' explicitly from the edge functions.
--
-- Depends on:
--   * public.profiles          (20260702145556_initial_schema_v1)
--   * public.payments          (20260702145556_initial_schema_v1)
--   * public.organizations     (20260805173233_admin_foundation_core_v1)

-- ------------------------------------------------------------
-- 1) Recurring donation subscriptions
-- ------------------------------------------------------------
create table if not exists public.donation_subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  org_id uuid references public.organizations(id) on delete set null,
  stripe_customer_id text,
  stripe_subscription_id text not null unique,
  status text not null default 'incomplete',
  interval text,                          -- 'month' | 'year'
  amount_cents integer,
  currency text not null default 'USD',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_donation_subs_profile
  on public.donation_subscriptions (profile_id, created_at desc);
create index if not exists idx_donation_subs_customer
  on public.donation_subscriptions (stripe_customer_id);

alter table public.donation_subscriptions enable row level security;

-- Owner can read their own subscriptions. Writes happen only via the service
-- role (Stripe webhook edge function), which bypasses RLS — no write policy.
drop policy if exists donation_subs_select on public.donation_subscriptions;
create policy donation_subs_select on public.donation_subscriptions
  for select to authenticated
  using (profile_id = (select auth.uid()));

-- keep updated_at fresh (set_updated_at defined in initial schema)
drop trigger if exists trg_donation_subs_updated on public.donation_subscriptions;
create trigger trg_donation_subs_updated
  before update on public.donation_subscriptions
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- 2) Stripe reconciliation columns on payments (additive)
-- ------------------------------------------------------------
alter table public.payments
  add column if not exists stripe_session_id text;
alter table public.payments
  add column if not exists stripe_payment_intent_id text;
alter table public.payments
  add column if not exists stripe_subscription_id text;
-- Generic provider label alongside the legacy `processor` column. Nullable with
-- no default so existing authorize_net rows/inserts are unaffected; the Stripe
-- edge functions set provider='stripe' explicitly.
alter table public.payments
  add column if not exists provider text;

create index if not exists idx_payments_stripe_session
  on public.payments (stripe_session_id);
create index if not exists idx_payments_stripe_pi
  on public.payments (stripe_payment_intent_id);
create unique index if not exists uq_payments_stripe_pi
  on public.payments (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

-- ------------------------------------------------------------
-- 3) Webhook idempotency
-- ------------------------------------------------------------
create table if not exists public.processed_stripe_events (
  event_id text primary key,
  processed_at timestamptz not null default now()
);
-- Written/read only by the service role (webhook). RLS on with no policy = no
-- direct client access; the service role bypasses RLS.
alter table public.processed_stripe_events enable row level security;
