-- "My Groups" visibility (legacy semantics): a group post is visible to users
-- whose role/diagnosis tags overlap the post's audience_tags.
alter table public.posts add column if not exists audience_tags text[] not null default '{}';
create index if not exists idx_posts_audience on public.posts using gin (audience_tags);

-- The caller's tags (role + diagnosis descriptions, lowercased), computed once.
create or replace function public.my_tags()
returns text[] language sql security definer set search_path = public stable as $$
  select coalesce(array_agg(distinct lower(vd.description)), '{}')
  from public.profiles p
  join public.value_definitions vd
    on vd.id = p.role_id or vd.id = any(p.diagnosis_type_ids)
  where p.id = auth.uid();
$$;
revoke execute on function public.my_tags() from anon, public;

drop policy posts_select on public.posts;
create policy posts_select on public.posts for select to authenticated
  using (
    visibility = 'all'
    or author_id = auth.uid()
    or (visibility = 'group' and group_id is not null and exists (
      select 1 from public.group_members gm
      where gm.group_id = posts.group_id and gm.profile_id = auth.uid()
    ))
    or (visibility = 'group' and group_id is null and audience_tags && public.my_tags())
  );
