-- Structured support intake. The user answers a short guided form; a ticket
-- row is logged here AND a formatted summary is posted into the support DM so
-- the agent still replies in chat. Owner-only from the client; support staff
-- read/triage via the dashboard (service role).
create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category text not null,
  subject text not null,
  description text not null,
  status text not null default 'open' check (status in ('open','in_progress','closed')),
  conversation_id uuid references public.conversations(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint support_subject_len check (char_length(subject) between 1 and 200),
  constraint support_description_len check (char_length(description) between 1 and 4000),
  constraint support_category_len check (char_length(category) <= 60)
);
create index idx_support_tickets_user on public.support_tickets (user_id, created_at desc);
create index idx_support_tickets_status on public.support_tickets (status, created_at desc);

alter table public.support_tickets enable row level security;

-- Owner can create and read their OWN tickets; no client update/delete
-- (status transitions happen support-side via service role).
create policy support_tickets_insert on public.support_tickets for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy support_tickets_select on public.support_tickets for select to authenticated
  using (user_id = (select auth.uid()));

create trigger trg_support_tickets_updated before update on public.support_tickets
  for each row execute function public.set_updated_at();

-- Abuse guard: max 5 tickets / 10 min per user (reuses the generic limiter).
create trigger trg_rl_support_tickets before insert on public.support_tickets
  for each row execute function public.rate_limit_check('5','600','user_id');
create index idx_rl_support_tickets_actor_time on public.support_tickets (user_id, created_at desc);
