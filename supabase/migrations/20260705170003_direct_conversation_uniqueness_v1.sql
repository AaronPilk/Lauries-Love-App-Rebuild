-- Canonical key for 1:1 conversations: 'lesser-uuid:greater-uuid'.
-- Enforces AT MOST ONE direct conversation per user pair and provides an
-- atomic find-or-create RPC (fixes the check-then-insert race).

alter table public.conversations
  add column if not exists direct_key text;

-- Backfill existing direct conversations (exactly-2-member ones).
update public.conversations c
set direct_key = sub.key
from (
  select cm.conversation_id,
         (min(cm.profile_id::text) || ':' || max(cm.profile_id::text)) as key
  from public.conversation_members cm
  join public.conversations cv on cv.id = cm.conversation_id
  where cv.is_group = false
  group by cm.conversation_id
  having count(*) = 2
) sub
where c.id = sub.conversation_id
  and c.direct_key is null;

-- Dedupe safety: if a pair already has duplicates, keep the oldest and
-- null the key on the rest (they remain readable; app resolves to keyed one).
with ranked as (
  select id, direct_key,
         row_number() over (partition by direct_key order by created_at asc) rn
  from public.conversations
  where direct_key is not null
)
update public.conversations c
set direct_key = null
from ranked r
where c.id = r.id and r.rn > 1;

create unique index if not exists uq_conversations_direct_key
  on public.conversations (direct_key)
  where direct_key is not null;

-- Atomic find-or-create. SECURITY DEFINER so both memberships are written in
-- one transaction; caller identity comes from auth.uid(), NOT a parameter.
create or replace function public.find_or_create_direct_conversation(other_profile uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  key text;
  conv uuid;
begin
  if me is null then
    raise exception 'not authenticated';
  end if;
  if other_profile is null or other_profile = me then
    raise exception 'invalid target profile';
  end if;
  if not exists (select 1 from public.profiles where id = other_profile) then
    raise exception 'target profile does not exist';
  end if;

  key := least(me::text, other_profile::text) || ':' || greatest(me::text, other_profile::text);

  select id into conv from public.conversations where direct_key = key;
  if conv is not null then
    return conv;
  end if;

  begin
    insert into public.conversations (is_group, created_by, direct_key)
    values (false, me, key)
    returning id into conv;
    insert into public.conversation_members (conversation_id, profile_id)
    values (conv, me), (conv, other_profile);
  exception when unique_violation then
    select id into conv from public.conversations where direct_key = key;
  end;

  return conv;
end;
$$;

revoke execute on function public.find_or_create_direct_conversation(uuid) from anon, public;
grant execute on function public.find_or_create_direct_conversation(uuid) to authenticated;
