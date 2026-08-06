-- Community features v1 — search, hashtags, mentions, reporting, welcome.
--
-- ADDITIVE + IDEMPOTENT ONLY. This file is applied by hand in a coordinated
-- window (DB is shared with Jeremy). It never drops or renames existing
-- tables/columns; every object uses `if not exists` / `create or replace` /
-- `drop ... if exists` so it can be re-run safely.
--
-- Depends on objects already in the DB:
--   * posts(body, author_id, visibility, group_id, audience_tags, like_count)
--   * comments(post_id, author_id, body)
--   * reactions(entity_type, entity_id, user_id)  -- polymorphic (no FK to posts)
--   * notifications(recipient_id, sender_id, entity_type, content, meta)
--   * public.can_see_post(uuid)            (20260705231023_rls_privacy_v1)
--   * public.organizations / public.moderation_queue (20260805173233_admin_foundation_core_v1)
--
-- Notification entity_type values used here follow the existing convention
-- (NEW_LIKE / NEW_MESSAGE / NEW_FRIEND_REQUEST): we add NEW_MENTION and WELCOME.

-- ============================================================
-- 1) POST FULL-TEXT SEARCH
-- ============================================================
-- Stored generated tsvector off posts.body. to_tsvector(regconfig, text) is
-- IMMUTABLE, so it is valid in a generated column; existing rows backfill
-- automatically when the column is added.
alter table public.posts
  add column if not exists search_tsv tsvector
  generated always as (to_tsvector('english', coalesce(body, ''))) stored;

create index if not exists idx_posts_search_tsv on public.posts using gin (search_tsv);

-- SECURITY INVOKER: the caller's RLS on posts still applies, so private/group
-- posts they cannot see never appear in results. websearch_to_tsquery safely
-- parses arbitrary user input (no injection, no syntax errors on stray chars).
create or replace function public.search_posts(q text)
returns setof public.posts
language sql
stable
security invoker
set search_path = public
as $$
  select p.*
  from public.posts p
  where q is not null
    and length(trim(q)) > 0
    and p.search_tsv @@ websearch_to_tsquery('english', q)
  order by p.created_at desc
  limit 100;
$$;
revoke execute on function public.search_posts(text) from anon, public;
grant execute on function public.search_posts(text) to authenticated;

-- ============================================================
-- 2) HASHTAGS
-- ============================================================
create table if not exists public.post_hashtags (
  post_id uuid not null references public.posts(id) on delete cascade,
  tag text not null,
  created_at timestamptz not null default now(),
  primary key (post_id, tag)
);
create index if not exists idx_post_hashtags_tag on public.post_hashtags (lower(tag));

alter table public.post_hashtags enable row level security;
-- Readable only if the caller can see the parent post (mirrors comments/reactions).
drop policy if exists post_hashtags_select on public.post_hashtags;
create policy post_hashtags_select on public.post_hashtags for select to authenticated
  using (public.can_see_post(post_id));
-- Writes happen ONLY through the trigger below (SECURITY DEFINER); no direct
-- client insert path is granted.

-- Parse #word tokens from posts.body on insert/update and resync the tag rows.
create or replace function public.sync_post_hashtags()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.post_hashtags where post_id = new.id;
  insert into public.post_hashtags (post_id, tag)
  select distinct new.id, lower(m[1])
  from regexp_matches(coalesce(new.body, ''), '#([A-Za-z0-9_]{1,50})', 'g') as m
  on conflict do nothing;
  return null;
end $$;
revoke execute on function public.sync_post_hashtags() from anon, authenticated, public;

drop trigger if exists trg_posts_hashtags on public.posts;
create trigger trg_posts_hashtags
  after insert or update of body on public.posts
  for each row execute function public.sync_post_hashtags();

-- Visible posts carrying a given tag. SECURITY INVOKER => posts RLS applies.
create or replace function public.posts_by_hashtag(tag text)
returns setof public.posts
language sql
stable
security invoker
set search_path = public
as $$
  select p.*
  from public.posts p
  join public.post_hashtags h on h.post_id = p.id
  where h.tag = lower(trim(coalesce(tag, '')))
    and length(trim(coalesce(tag, ''))) > 0
  order by p.created_at desc
  limit 100;
$$;
revoke execute on function public.posts_by_hashtag(text) from anon, public;
grant execute on function public.posts_by_hashtag(text) to authenticated;

-- ============================================================
-- 3) MENTIONS
-- ============================================================
-- The client inserts these when composing (it resolves @name -> profile id).
create table if not exists public.post_mentions (
  post_id uuid not null references public.posts(id) on delete cascade,
  mentioned_profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, mentioned_profile_id)
);
create index if not exists idx_post_mentions_profile on public.post_mentions (mentioned_profile_id);

alter table public.post_mentions enable row level security;
drop policy if exists post_mentions_select on public.post_mentions;
create policy post_mentions_select on public.post_mentions for select to authenticated
  using (public.can_see_post(post_id));
-- Only the post's author may record mentions for their own post.
drop policy if exists post_mentions_insert on public.post_mentions;
create policy post_mentions_insert on public.post_mentions for insert to authenticated
  with check (
    exists (
      select 1 from public.posts p
      where p.id = post_id and p.author_id = (select auth.uid())
    )
  );

-- On mention insert -> a NEW_MENTION notification for the mentioned user.
-- SECURITY DEFINER so it can write notifications regardless of the recipient
-- relationship gate (a mention is itself the relationship).
create or replace function public.notify_post_mention()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_author uuid;
  v_author_name text;
begin
  select author_id into v_author from public.posts where id = new.post_id;
  -- Never notify a user for mentioning themselves.
  if v_author is null or v_author = new.mentioned_profile_id then
    return null;
  end if;
  select coalesce(display_name, first_name, 'Someone')
    into v_author_name
    from public.profiles where id = v_author;

  insert into public.notifications (recipient_id, sender_id, entity_type, content, meta)
  values (
    new.mentioned_profile_id,
    v_author,
    'NEW_MENTION',
    coalesce(v_author_name, 'Someone') || ' mentioned you in a post',
    jsonb_build_object(
      'postId', new.post_id,
      'redirectUrl', 'sendbird/' || new.post_id::text
    )
  );
  return null;
end $$;
revoke execute on function public.notify_post_mention() from anon, authenticated, public;

drop trigger if exists trg_post_mentions_notify on public.post_mentions;
create trigger trg_post_mentions_notify
  after insert on public.post_mentions
  for each row execute function public.notify_post_mention();

-- ============================================================
-- 4) POST DELETION — RLS + cascade cleanup
-- ============================================================
-- Owner-delete policy already exists in the initial schema; (re)assert it
-- idempotently in case a fresh env is missing it.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'posts' and policyname = 'posts_delete'
  ) then
    create policy posts_delete on public.posts for delete to authenticated
      using (author_id = (select auth.uid()));
  end if;
end $$;

-- reactions are polymorphic (entity_type/entity_id) with NO FK to posts, so a
-- post delete would orphan its likes and its comments' likes. comments,
-- post_hashtags and post_mentions all cascade via their FKs. Clean the
-- reactions explicitly before the row (and its cascaded comments) disappear.
create or replace function public.cleanup_post_relations()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.reactions
    where entity_type = 'post' and entity_id = old.id;
  delete from public.reactions
    where entity_type = 'comment'
      and entity_id in (select id from public.comments where post_id = old.id);
  return old;
end $$;
revoke execute on function public.cleanup_post_relations() from anon, authenticated, public;

drop trigger if exists trg_posts_cleanup on public.posts;
create trigger trg_posts_cleanup
  before delete on public.posts
  for each row execute function public.cleanup_post_relations();

-- ============================================================
-- 5) GROUP SEARCH (trigram)
-- ============================================================
create extension if not exists pg_trgm;
create index if not exists idx_groups_name_trgm on public.groups using gin (name gin_trgm_ops);

-- groups.select policy is `using (true)`, so SECURITY INVOKER is fine.
create or replace function public.search_groups(q text)
returns setof public.groups
language sql
stable
security invoker
set search_path = public
as $$
  select g.*
  from public.groups g
  where q is null
     or length(trim(q)) = 0
     or g.name ilike '%' || q || '%'
  order by g.name
  limit 100;
$$;
revoke execute on function public.search_groups(text) from anon, public;
grant execute on function public.search_groups(text) to authenticated;

-- ============================================================
-- 6) WELCOME AUTOMATION
-- ============================================================
-- Fires once, when the profile row is first created (handle_new_user inserts it
-- on auth signup). sender_id is null (system message). Warm, on-brand copy.
create or replace function public.notify_welcome()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (recipient_id, sender_id, entity_type, content, meta)
  values (
    new.id,
    null,
    'WELCOME',
    'Welcome to Laurie''s Love. You are not alone here — take a look around, find people who get it, and share whatever is on your heart whenever you are ready. We are so glad you came.',
    jsonb_build_object('redirectUrl', '')
  );
  return null;
end $$;
revoke execute on function public.notify_welcome() from anon, authenticated, public;

drop trigger if exists trg_profiles_welcome on public.profiles;
create trigger trg_profiles_welcome
  after insert on public.profiles
  for each row execute function public.notify_welcome();

-- ============================================================
-- 7) USER REPORT -> MODERATION QUEUE
-- ============================================================
-- moderation_queue.entity_type is CHECK-constrained to ('post','comment'); this
-- function enforces the same and stamps flagged_by='user', status='pending'.
create or replace function public.report_content(
  p_entity_type text,
  p_entity_id uuid,
  p_reason text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  v_org uuid;
  v_author uuid;
  v_id uuid;
begin
  if me is null then
    raise exception 'not authenticated';
  end if;
  if p_entity_type not in ('post', 'comment') then
    raise exception 'unsupported entity type: %', p_entity_type;
  end if;

  select id into v_org from public.organizations where slug = 'lauries-love' limit 1;

  if p_entity_type = 'post' then
    select author_id into v_author from public.posts where id = p_entity_id;
  else
    select author_id into v_author from public.comments where id = p_entity_id;
  end if;

  insert into public.moderation_queue
    (org_id, entity_type, entity_id, author_id, reason, flagged_by, status)
  values
    (v_org, p_entity_type, p_entity_id, v_author,
     left(coalesce(p_reason, ''), 500), 'user', 'pending')
  returning id into v_id;

  return v_id;
end $$;
revoke execute on function public.report_content(text, uuid, text) from anon, public;
grant execute on function public.report_content(text, uuid, text) to authenticated;

-- ============================================================
-- 8) KEYWORD HEURISTIC MODERATION (PLACEHOLDER)
-- ============================================================
-- ⚠️ PLACEHOLDER — to be REPLACED by the OpenAI moderation edge function.
-- This is a naive banned-substring scan so the human-in-the-loop queue has a
-- signal source before the AI classifier is wired. Keep the list tiny and
-- obvious; real moderation (context, severity, categories) comes from OpenAI.
create or replace function public.heuristic_moderation_flag()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org uuid;
  -- Intentionally minimal. Replace with the OpenAI moderation call.
  banned text[] := array['child abuse', 'kill yourself', 'buy followers now'];
  w text;
  v_kind text := tg_argv[0];   -- 'post' | 'comment'
  hit boolean := false;
begin
  foreach w in array banned loop
    if position(w in lower(coalesce(new.body, ''))) > 0 then
      hit := true;
      exit;
    end if;
  end loop;

  if hit then
    -- Don't pile duplicate pending flags on the same entity.
    if not exists (
      select 1 from public.moderation_queue
      where entity_type = v_kind and entity_id = new.id and status = 'pending'
    ) then
      select id into v_org from public.organizations where slug = 'lauries-love' limit 1;
      insert into public.moderation_queue
        (org_id, entity_type, entity_id, author_id, reason, flagged_by, status)
      values
        (v_org, v_kind, new.id, new.author_id,
         'keyword heuristic match (placeholder — replace with OpenAI moderation)',
         'ai', 'pending');
    end if;
  end if;
  return null;
end $$;
revoke execute on function public.heuristic_moderation_flag() from anon, authenticated, public;

drop trigger if exists trg_posts_moderation on public.posts;
create trigger trg_posts_moderation
  after insert or update of body on public.posts
  for each row execute function public.heuristic_moderation_flag('post');

drop trigger if exists trg_comments_moderation on public.comments;
create trigger trg_comments_moderation
  after insert on public.comments
  for each row execute function public.heuristic_moderation_flag('comment');
