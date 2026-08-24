-- ============================================================================
-- SERVER-SIDE MESSAGE PUSH  (MANUAL — do NOT put in supabase/migrations/)
-- ============================================================================
-- Fires a push notification to a conversation's recipients when a message is
-- inserted — so delivery works even when the sender's app is backgrounded,
-- instead of relying on the client to call send-push.
--
-- ⚠️ REVIEW + APPLY ONLY WHEN PUSH IS LIVE. It lives OUTSIDE supabase/migrations/
-- on purpose so `supabase db push` never applies it automatically. Before
-- enabling: FCM_SERVER_KEY set, send-push deployed, tested end-to-end on device.
--
-- SAFETY: the trigger is AFTER INSERT and every side-effect is wrapped so it can
-- NEVER fail or block a message insert (a thrown trigger would roll back the
-- send). If pg_net is unavailable or config is missing, it silently no-ops.
--
-- WHEN YOU ENABLE THIS: remove the client-side message push calls
-- (sendPushNotificationToServer in MessagesTabChat / MessagesTabChatGroup) or
-- users will get a DOUBLE push.
-- ============================================================================

-- 1) Async HTTP from Postgres (Supabase provides pg_net in the extensions schema).
create extension if not exists pg_net with schema extensions;

-- 2) Locked config table: the send-push function URL + a service token.
--    RLS on, no policies => no client access; only the service role / SQL reads it.
--    (For stronger secret handling, store the token in Supabase Vault instead.)
create table if not exists private_config (
  key text primary key,
  value text not null
);
alter table private_config enable row level security;
revoke all on table private_config from anon, authenticated;

-- Seed these two rows with YOUR values before enabling:
--   insert into private_config(key,value) values
--     ('send_push_url','https://<PROJECT_REF>.functions.supabase.co/send-push'),
--     ('service_token','<SUPABASE_SERVICE_ROLE_KEY>')
--   on conflict (key) do update set value = excluded.value;

-- 3) Fail-safe trigger function.
create or replace function public.notify_message_push()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_url text;
  v_token text;
  v_recipients uuid[];
  v_sender_name text;
begin
  begin
    select value into v_url   from private_config where key = 'send_push_url';
    select value into v_token from private_config where key = 'service_token';
    if v_url is null or v_token is null then
      return null;  -- not configured yet — no-op
    end if;

    -- Recipients = every conversation member except the sender.
    select array_agg(cm.profile_id)
      into v_recipients
      from public.conversation_members cm
      where cm.conversation_id = new.conversation_id
        and cm.profile_id <> new.sender_id;
    -- (Group chats derive membership from group_members; extend here if needed.)

    if v_recipients is null or array_length(v_recipients, 1) is null then
      return null;
    end if;

    select coalesce(display_name, first_name, 'New message')
      into v_sender_name
      from public.profiles where id = new.sender_id;

    perform net.http_post(
      url     := v_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_token
      ),
      body    := jsonb_build_object(
        'userIds', to_jsonb(v_recipients),
        'title',   coalesce(v_sender_name, 'New message'),
        'body',    coalesce(new.body, '📎 Attachment'),
        'data',    jsonb_build_object('conversationId', new.conversation_id)
      )
    );
  exception when others then
    -- NEVER let push failure block the message insert.
    if current_setting('server_version_num')::int >= 0 then
      raise notice 'notify_message_push suppressed error: %', sqlerrm;
    end if;
  end;
  return null;
end $$;
revoke execute on function public.notify_message_push() from anon, authenticated, public;

-- 4) Attach the trigger (AFTER INSERT — non-blocking).
drop trigger if exists trg_messages_push on public.messages;
create trigger trg_messages_push
  after insert on public.messages
  for each row execute function public.notify_message_push();

-- To DISABLE later:  drop trigger trg_messages_push on public.messages;
