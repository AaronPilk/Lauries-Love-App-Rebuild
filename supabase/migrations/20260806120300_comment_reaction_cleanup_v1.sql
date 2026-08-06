-- Comment reaction cleanup (additive, idempotent)
-- reactions is polymorphic (entity_type/entity_id) with NO foreign key to
-- comments, so hard-deleting a single comment would orphan its 'like' rows.
-- The post-delete path already scrubs comment reactions in bulk; this covers
-- the single-comment delete path added in the community-features wave.

create or replace function public.cleanup_comment_reactions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.reactions
  where entity_type = 'comment' and entity_id = old.id;
  return old;
end;
$$;

drop trigger if exists trg_cleanup_comment_reactions on public.comments;
create trigger trg_cleanup_comment_reactions
  before delete on public.comments
  for each row execute function public.cleanup_comment_reactions();
