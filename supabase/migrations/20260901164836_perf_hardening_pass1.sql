-- Audit Pass 1 perf items (advisor-flagged, safe).

-- 1) Init-plan: evaluate auth.uid() once per query, not per row.
alter policy pfv_insert on public.profile_field_values
  with check (profile_id = (select auth.uid()));
alter policy pfv_update on public.profile_field_values
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));
alter policy pfv_delete on public.profile_field_values
  using (profile_id = (select auth.uid()));

-- 2) Drop duplicate index (identical to idx_support_tickets_user: (user_id, created_at DESC)).
drop index if exists public.idx_rl_support_tickets_actor_time;

-- 3) Covering indexes for the unindexed foreign keys.
create index if not exists idx_donation_subscriptions_org on public.donation_subscriptions(org_id);
create index if not exists idx_moderation_queue_author on public.moderation_queue(author_id);
create index if not exists idx_moderation_queue_org on public.moderation_queue(org_id);
create index if not exists idx_moderation_queue_reviewed_by on public.moderation_queue(reviewed_by);
create index if not exists idx_support_tickets_conversation on public.support_tickets(conversation_id);
