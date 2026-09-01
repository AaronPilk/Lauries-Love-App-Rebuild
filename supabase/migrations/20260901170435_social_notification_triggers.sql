-- Audit Pass 1 MEDIUM: the social loop produced no notifications (only @mentions
-- + welcome had triggers). Add AFTER-write notification triggers for likes,
-- comments, new messages, and friend request/accept. Mirrors the existing
-- notify_post_mention pattern: SECURITY DEFINER (so the insert can't fail RLS
-- and abort the parent action), skip self-notify, sender_id = the actor.

create or replace function public.notify_reaction()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare v_author uuid; v_name text;
begin
  if new.entity_type = 'post' then
    select author_id into v_author from public.posts where id = new.entity_id;
  elsif new.entity_type = 'comment' then
    select author_id into v_author from public.comments where id = new.entity_id;
  else
    return null;
  end if;
  if v_author is null or v_author = new.user_id then return null; end if;
  select coalesce(display_name, first_name, 'Someone') into v_name
    from public.profiles where id = new.user_id;
  insert into public.notifications (recipient_id, sender_id, entity_type, content, meta)
  values (v_author, new.user_id, 'POST_REACTION',
    coalesce(v_name, 'Someone') || ' liked your ' || new.entity_type,
    jsonb_build_object(new.entity_type || 'Id', new.entity_id, 'kind', new.kind));
  return null;
end $$;

drop trigger if exists trg_reactions_notify on public.reactions;
create trigger trg_reactions_notify after insert on public.reactions
  for each row execute function public.notify_reaction();

create or replace function public.notify_comment()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare v_author uuid; v_name text;
begin
  select author_id into v_author from public.posts where id = new.post_id;
  if v_author is null or v_author = new.author_id then return null; end if;
  select coalesce(display_name, first_name, 'Someone') into v_name
    from public.profiles where id = new.author_id;
  insert into public.notifications (recipient_id, sender_id, entity_type, content, meta)
  values (v_author, new.author_id, 'POST_COMMENT',
    coalesce(v_name, 'Someone') || ' commented on your post',
    jsonb_build_object('postId', new.post_id, 'commentId', new.id));
  return null;
end $$;

drop trigger if exists trg_comments_notify on public.comments;
create trigger trg_comments_notify after insert on public.comments
  for each row execute function public.notify_comment();

create or replace function public.notify_message()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare v_name text;
begin
  select coalesce(display_name, first_name, 'Someone') into v_name
    from public.profiles where id = new.sender_id;
  insert into public.notifications (recipient_id, sender_id, entity_type, content, meta)
  select cm.profile_id, new.sender_id, 'MESSAGE',
         coalesce(v_name, 'Someone') || ' sent you a message',
         jsonb_build_object('conversationId', new.conversation_id, 'messageId', new.id)
  from public.conversation_members cm
  where cm.conversation_id = new.conversation_id
    and cm.profile_id <> new.sender_id;
  return null;
end $$;

drop trigger if exists trg_messages_notify on public.messages;
create trigger trg_messages_notify after insert on public.messages
  for each row execute function public.notify_message();

create or replace function public.notify_friend_request()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare v_name text;
begin
  if new.status <> 'pending' then return null; end if;
  select coalesce(display_name, first_name, 'Someone') into v_name
    from public.profiles where id = new.requester_id;
  insert into public.notifications (recipient_id, sender_id, entity_type, content, meta)
  values (new.addressee_id, new.requester_id, 'FRIEND_REQUEST',
    coalesce(v_name, 'Someone') || ' sent you a friend request',
    jsonb_build_object('friendshipId', new.id));
  return null;
end $$;

drop trigger if exists trg_friend_request_notify on public.friendships;
create trigger trg_friend_request_notify after insert on public.friendships
  for each row execute function public.notify_friend_request();

create or replace function public.notify_friend_accept()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare v_name text;
begin
  if new.status = 'accepted' and old.status is distinct from 'accepted' then
    select coalesce(display_name, first_name, 'Someone') into v_name
      from public.profiles where id = new.addressee_id;
    insert into public.notifications (recipient_id, sender_id, entity_type, content, meta)
    values (new.requester_id, new.addressee_id, 'FRIEND_ACCEPT',
      coalesce(v_name, 'Someone') || ' accepted your friend request',
      jsonb_build_object('friendshipId', new.id));
  end if;
  return null;
end $$;

drop trigger if exists trg_friend_accept_notify on public.friendships;
create trigger trg_friend_accept_notify after update on public.friendships
  for each row execute function public.notify_friend_accept();
