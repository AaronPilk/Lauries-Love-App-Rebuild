-- Fix the "global newest-200 messages" last-message heuristic: store the last
-- message preview directly on conversations, maintained by the bump trigger.
alter table public.conversations
  add column if not exists last_message_body text,
  add column if not exists last_message_sender uuid;

update public.conversations c
set last_message_body = m.body,
    last_message_sender = m.sender_id,
    last_message_at = m.created_at
from (
  select distinct on (conversation_id) conversation_id, body, sender_id, created_at
  from public.messages
  order by conversation_id, created_at desc
) m
where m.conversation_id = c.id;

create or replace function public.bump_conversation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.conversations
     set last_message_at = new.created_at,
         last_message_body = coalesce(new.body, '📎 Attachment'),
         last_message_sender = new.sender_id
   where id = new.conversation_id;
  return new;
end $$;
revoke execute on function public.bump_conversation() from anon, authenticated, public;
