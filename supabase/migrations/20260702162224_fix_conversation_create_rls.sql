-- Fix: creating a conversation failed because the INSERT ... RETURNING row
-- couldn't be read back — the creator isn't a member yet at that moment.
-- Creators may always see their own conversations.
drop policy conversations_select on public.conversations;
create policy conversations_select on public.conversations for select to authenticated
  using (created_by = auth.uid() or public.is_conversation_member(id));

-- Same principle for reading membership rows during setup.
drop policy conv_members_select on public.conversation_members;
create policy conv_members_select on public.conversation_members for select to authenticated
  using (
    profile_id = auth.uid()
    or public.is_conversation_member(conversation_id)
    or exists (select 1 from public.conversations c
               where c.id = conversation_id and c.created_by = auth.uid())
  );
