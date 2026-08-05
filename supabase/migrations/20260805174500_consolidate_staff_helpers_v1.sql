-- Consolidate to ONE set of staff-check functions. Jeremy's is_support_owner()
-- / is_support_staff() (which read support_staff and back his support_* policies)
-- are the single source of truth. Repoint MY policies (platform_features,
-- moderation_queue) to them and drop my duplicate is_admin()/is_staff().
-- Only my objects are touched — Jeremy's policies are untouched.

drop policy if exists platform_features_admin_write on public.platform_features;
create policy platform_features_admin_write on public.platform_features for all to authenticated
  using (public.is_support_owner()) with check (public.is_support_owner());

drop policy if exists modqueue_staff_all on public.moderation_queue;
create policy modqueue_staff_all on public.moderation_queue for all to authenticated
  using (public.is_support_staff()) with check (public.is_support_staff());

drop function if exists public.is_admin();
drop function if exists public.is_staff();
