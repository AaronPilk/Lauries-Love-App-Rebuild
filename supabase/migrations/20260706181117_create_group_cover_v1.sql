-- The Create Group screen collects a cover photo, but create_group had no
-- parameter for it (silently dropped). Covers upload to the public 'avatars'
-- bucket under the creator's uid prefix (owner-write policy already enforces
-- that), and the path lands in groups.cover_path.
drop function if exists public.create_group(text, text, uuid[]);
create function public.create_group(
  p_name text,
  p_description text default null,
  p_member_ids uuid[] default '{}',
  p_cover_path text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  gid uuid;
  m uuid;
begin
  if me is null then raise exception 'not authenticated'; end if;
  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'group name required';
  end if;
  if char_length(p_name) > 120 then raise exception 'group name too long'; end if;
  if p_cover_path is not null and char_length(p_cover_path) > 300 then
    raise exception 'cover path too long';
  end if;
  if coalesce(array_length(p_member_ids, 1), 0) > 100 then
    raise exception 'too many initial members';
  end if;
  -- basic rate limit: max 5 groups per creator per hour
  if (select count(*) from public.groups
      where created_by = me and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'Too many requests — please slow down.';
  end if;

  insert into public.groups (name, description, cover_path, created_by)
  values (trim(p_name), p_description, p_cover_path, me)
  returning id into gid;

  insert into public.group_members (group_id, profile_id, member_role)
  values (gid, me, 'admin');

  foreach m in array p_member_ids loop
    if m <> me and exists (select 1 from public.profiles where id = m) then
      insert into public.group_members (group_id, profile_id)
      values (gid, m)
      on conflict do nothing;
    end if;
  end loop;

  return gid;
end;
$$;
revoke execute on function public.create_group(text, text, uuid[], text) from anon, public;
grant execute on function public.create_group(text, text, uuid[], text) to authenticated;
