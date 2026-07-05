-- Perf advisor remediation for scale:
-- 1) Cover all foreign keys with indexes
create index if not exists idx_comments_author on public.comments (author_id);
create index if not exists idx_conversations_created_by on public.conversations (created_by);
create index if not exists idx_conversations_group on public.conversations (group_id);
create index if not exists idx_groups_created_by on public.groups (created_by);
create index if not exists idx_messages_sender on public.messages (sender_id);
create index if not exists idx_notifications_sender on public.notifications (sender_id);
create index if not exists idx_profiles_role on public.profiles (role_id);
create index if not exists idx_reactions_user on public.reactions (user_id);

-- 2) auth.uid() must be an init-plan constant, not per-row:
--    wrap every policy call as (select auth.uid())
drop policy profiles_insert on public.profiles;
create policy profiles_insert on public.profiles for insert to authenticated
  with check (id = (select auth.uid()));
drop policy profiles_update on public.profiles;
create policy profiles_update on public.profiles for update to authenticated
  using (id = (select auth.uid()));

drop policy friendships_select on public.friendships;
create policy friendships_select on public.friendships for select to authenticated
  using (requester_id = (select auth.uid()) or addressee_id = (select auth.uid()));
drop policy friendships_insert on public.friendships;
create policy friendships_insert on public.friendships for insert to authenticated
  with check (requester_id = (select auth.uid()));
drop policy friendships_update on public.friendships;
create policy friendships_update on public.friendships for update to authenticated
  using (requester_id = (select auth.uid()) or addressee_id = (select auth.uid()));
drop policy friendships_delete on public.friendships;
create policy friendships_delete on public.friendships for delete to authenticated
  using (requester_id = (select auth.uid()) or addressee_id = (select auth.uid()));

drop policy group_members_insert on public.group_members;
create policy group_members_insert on public.group_members for insert to authenticated
  with check (profile_id = (select auth.uid()));
drop policy group_members_delete on public.group_members;
create policy group_members_delete on public.group_members for delete to authenticated
  using (profile_id = (select auth.uid()));

drop policy posts_select on public.posts;
create policy posts_select on public.posts for select to authenticated
  using (
    visibility = 'all'
    or author_id = (select auth.uid())
    or (visibility = 'group' and group_id is not null and exists (
      select 1 from public.group_members gm
      where gm.group_id = posts.group_id and gm.profile_id = (select auth.uid())
    ))
    or (visibility = 'group' and group_id is null and audience_tags && (select public.my_tags()))
  );
drop policy posts_insert on public.posts;
create policy posts_insert on public.posts for insert to authenticated
  with check (author_id = (select auth.uid()));
drop policy posts_update on public.posts;
create policy posts_update on public.posts for update to authenticated
  using (author_id = (select auth.uid()));
drop policy posts_delete on public.posts;
create policy posts_delete on public.posts for delete to authenticated
  using (author_id = (select auth.uid()));

drop policy comments_insert on public.comments;
create policy comments_insert on public.comments for insert to authenticated
  with check (author_id = (select auth.uid()));
drop policy comments_delete on public.comments;
create policy comments_delete on public.comments for delete to authenticated
  using (author_id = (select auth.uid()));

drop policy reactions_insert on public.reactions;
create policy reactions_insert on public.reactions for insert to authenticated
  with check (user_id = (select auth.uid()));
drop policy reactions_delete on public.reactions;
create policy reactions_delete on public.reactions for delete to authenticated
  using (user_id = (select auth.uid()));

drop policy conversations_select on public.conversations;
create policy conversations_select on public.conversations for select to authenticated
  using (created_by = (select auth.uid()) or public.is_conversation_member(id));
drop policy conversations_insert on public.conversations;
create policy conversations_insert on public.conversations for insert to authenticated
  with check (created_by = (select auth.uid()));

drop policy conv_members_select on public.conversation_members;
create policy conv_members_select on public.conversation_members for select to authenticated
  using (
    profile_id = (select auth.uid())
    or public.is_conversation_member(conversation_id)
    or exists (select 1 from public.conversations c
               where c.id = conversation_id and c.created_by = (select auth.uid()))
  );
drop policy conv_members_insert on public.conversation_members;
create policy conv_members_insert on public.conversation_members for insert to authenticated
  with check (
    profile_id = (select auth.uid())
    or exists (select 1 from public.conversations c
               where c.id = conversation_id and c.created_by = (select auth.uid()))
  );

drop policy messages_select on public.messages;
create policy messages_select on public.messages for select to authenticated
  using (public.is_conversation_member(conversation_id));
drop policy messages_insert on public.messages;
create policy messages_insert on public.messages for insert to authenticated
  with check (sender_id = (select auth.uid()) and public.is_conversation_member(conversation_id));

drop policy notifications_select on public.notifications;
create policy notifications_select on public.notifications for select to authenticated
  using (recipient_id = (select auth.uid()));
drop policy notifications_insert on public.notifications;
create policy notifications_insert on public.notifications for insert to authenticated
  with check (sender_id = (select auth.uid()));
drop policy notifications_update on public.notifications;
create policy notifications_update on public.notifications for update to authenticated
  using (recipient_id = (select auth.uid()));

drop policy payments_select on public.payments;
create policy payments_select on public.payments for select to authenticated
  using (profile_id = (select auth.uid()));
