-- Health-community privacy: group_members was world-readable (using true), so
-- any authenticated user could GET /rest/v1/group_members and reconstruct
-- WHO is in each condition-specific group (diagnosis inference). Gate the
-- roster to co-members only. Member COUNTS stay available (not a leak) via a
-- SECURITY DEFINER function so the browse-groups list still shows "N members".

create or replace function public.is_group_member(g uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.group_members
    where group_id = g and profile_id = auth.uid()
  );
$$;
revoke execute on function public.is_group_member(uuid) from anon, public;

drop policy group_members_select on public.group_members;
create policy group_members_select on public.group_members for select to authenticated
  using (public.is_group_member(group_id));

create or replace function public.group_member_counts()
returns table (group_id uuid, member_count bigint)
language sql security definer set search_path = public stable as $$
  select group_id, count(*)::bigint from public.group_members group by group_id;
$$;
revoke execute on function public.group_member_counts() from anon, public;
grant execute on function public.group_member_counts() to authenticated;
