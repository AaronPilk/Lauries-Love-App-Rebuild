-- Write-side gates matching the new read gates: you can only comment on /
-- react to content you can actually see.
drop policy comments_insert on public.comments;
create policy comments_insert on public.comments for insert to authenticated
  with check (author_id = (select auth.uid()) and public.can_see_post(post_id));

drop policy reactions_insert on public.reactions;
create policy reactions_insert on public.reactions for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and (
      (entity_type = 'post' and public.can_see_post(entity_id))
      or (entity_type = 'comment' and exists (
        select 1 from public.comments c
        where c.id = entity_id and public.can_see_post(c.post_id)
      ))
      or (entity_type = 'message' and exists (
        select 1 from public.messages m
        where m.id = entity_id and public.is_conversation_member(m.conversation_id)
      ))
    )
  );
