-- Group chat threads: ONE conversation per group; membership is DERIVED from
-- group_members (no duplicate membership rows to keep in sync — joining the
-- group = joining its chat, automatically).
create or replace function public.is_conversation_member(conv_id uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.conversation_members
    where conversation_id = conv_id and profile_id = auth.uid()
  )
  or exists (
    select 1
    from public.conversations c
    join public.group_members gm on gm.group_id = c.group_id
    where c.id = conv_id and gm.profile_id = auth.uid()
  );
$$;

-- One thread per group
create unique index if not exists uq_conversations_group
  on public.conversations (group_id) where group_id is not null;
