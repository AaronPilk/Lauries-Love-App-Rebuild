-- Privacy hardening for a health community (Codex + internal audit findings).

-- ============================================================
-- Helper: can the CALLER see this post? (mirrors posts_select; SECURITY
-- DEFINER so it can be used inside OTHER tables' policies without nested
-- RLS evaluation on posts)
-- ============================================================
create or replace function public.can_see_post(p_post uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.posts p
    where p.id = p_post
      and (
        p.visibility = 'all'
        or p.author_id = auth.uid()
        or (p.visibility = 'group' and p.group_id is not null and exists (
          select 1 from public.group_members gm
          where gm.group_id = p.group_id and gm.profile_id = auth.uid()
        ))
        or (p.visibility = 'group' and p.group_id is null
            and p.audience_tags && public.my_tags())
      )
  );
$$;
revoke execute on function public.can_see_post(uuid) from anon, public;

-- 1) COMMENTS: bodies were readable by ANY authenticated user even on
--    group-only posts. Gate by parent post visibility.
drop policy comments_select on public.comments;
create policy comments_select on public.comments for select to authenticated
  using (public.can_see_post(post_id));

-- 2) REACTIONS: same gate per entity type (post / comment / message).
drop policy reactions_select on public.reactions;
create policy reactions_select on public.reactions for select to authenticated
  using (
    (entity_type = 'post' and public.can_see_post(entity_id))
    or (entity_type = 'comment' and exists (
      select 1 from public.comments c
      where c.id = entity_id and public.can_see_post(c.post_id)
    ))
    or (entity_type = 'message' and exists (
      select 1 from public.messages m
      where m.id = entity_id and public.is_conversation_member(m.conversation_id)
    ))
  );

-- 3) CONVERSATION MEMBERSHIP: a creator could force-add ANY user.
--    Self-insert only; DM/group membership goes through SECURITY DEFINER
--    RPCs (find_or_create_direct_conversation) / derived group membership.
drop policy conv_members_insert on public.conversation_members;
create policy conv_members_insert on public.conversation_members for insert to authenticated
  with check (profile_id = (select auth.uid()));

-- 4) FRIENDSHIPS: requester could self-accept. Only the ADDRESSEE may
--    update (accept); the requester cancels via DELETE (existing policy).
drop policy friendships_update on public.friendships;
create policy friendships_update on public.friendships for update to authenticated
  using (addressee_id = (select auth.uid()))
  with check (addressee_id = (select auth.uid()));

-- 5) NOTIFICATIONS: recipient was unrestricted (spam any stranger).
--    Sender must have a real relationship with the recipient: a friendship
--    row (any status/direction), a shared conversation, or the recipient
--    authored content the sender can see (like/comment notifications).
create or replace function public.can_notify(p_recipient uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    exists (
      select 1 from public.friendships f
      where (f.requester_id = auth.uid() and f.addressee_id = p_recipient)
         or (f.addressee_id = auth.uid() and f.requester_id = p_recipient)
    )
    or exists (
      select 1
      from public.conversation_members a
      join public.conversation_members b on b.conversation_id = a.conversation_id
      where a.profile_id = auth.uid() and b.profile_id = p_recipient
    )
    or exists (
      select 1
      from public.group_members ga
      join public.group_members gb on gb.group_id = ga.group_id
      where ga.profile_id = auth.uid() and gb.profile_id = p_recipient
    )
    or exists (
      select 1 from public.posts p
      where p.author_id = p_recipient and public.can_see_post(p.id)
    )
    or exists (
      select 1 from public.comments c
      where c.author_id = p_recipient and public.can_see_post(c.post_id)
    );
$$;
revoke execute on function public.can_notify(uuid) from anon, public;

drop policy notifications_insert on public.notifications;
create policy notifications_insert on public.notifications for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and public.can_notify(recipient_id)
  );

-- 6) MAP: users_in_bbox returned FULL profile rows (email, phone,
--    push_token, exact everything). Narrow to the display projection the
--    map/cards actually render. (Return-type change requires drop.)
drop function public.users_in_bbox(double precision, double precision, double precision, double precision, integer);
create function public.users_in_bbox(
  min_lat double precision,
  min_lng double precision,
  max_lat double precision,
  max_lng double precision,
  max_rows integer default 500
)
returns table (
  id uuid,
  first_name text,
  last_name text,
  display_name text,
  avatar_path text,
  role_id uuid,
  diagnosis_type_ids uuid[],
  diagnosis_subtype_ids uuid[],
  diagnosis_year text,
  age_range text,
  gender text,
  city text,
  state text,
  country text,
  latitude double precision,
  longitude double precision,
  active boolean,
  created_at timestamptz
)
language sql
stable
security invoker
set search_path = public
as $$
  select id, first_name, last_name, display_name, avatar_path, role_id,
         diagnosis_type_ids, diagnosis_subtype_ids, diagnosis_year,
         age_range, gender, city, state, country, latitude, longitude,
         active, created_at
  from public.profiles
  where active
    and latitude  between min_lat and max_lat
    and longitude between min_lng and max_lng
  limit least(greatest(coalesce(max_rows, 500), 1), 1000);
$$;
grant execute on function public.users_in_bbox(double precision, double precision, double precision, double precision, integer) to authenticated;
revoke execute on function public.users_in_bbox(double precision, double precision, double precision, double precision, integer) from anon, public;

-- 7) GROUPS: user-created groups (Create Group screen). Atomic RPC:
--    group + creator-admin + optional invitees in one transaction.
--    (groups had NO insert policy — direct inserts stay blocked; only
--    this audited RPC can create.)
create or replace function public.create_group(
  p_name text,
  p_description text default null,
  p_member_ids uuid[] default '{}'
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
  if coalesce(array_length(p_member_ids, 1), 0) > 100 then
    raise exception 'too many initial members';
  end if;
  -- basic rate limit: max 5 groups per creator per hour
  if (select count(*) from public.groups
      where created_by = me and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'Too many requests — please slow down.';
  end if;

  insert into public.groups (name, description, created_by)
  values (trim(p_name), p_description, me)
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
revoke execute on function public.create_group(text, text, uuid[]) from anon, public;
grant execute on function public.create_group(text, text, uuid[]) to authenticated;

-- 8) Rate-limit trigger COUNTs: composite (actor, created_at) indexes so
--    per-insert cost stays flat as history grows.
create index if not exists idx_rl_messages_actor_time on public.messages (sender_id, created_at desc);
create index if not exists idx_rl_comments_actor_time on public.comments (author_id, created_at desc);
create index if not exists idx_rl_reactions_actor_time on public.reactions (user_id, created_at desc);
create index if not exists idx_rl_friendships_actor_time on public.friendships (requester_id, created_at desc);
create index if not exists idx_rl_notifications_actor_time on public.notifications (sender_id, created_at desc);
create index if not exists idx_rl_conversations_actor_time on public.conversations (created_by, created_at desc);
