-- 1) CHAT ATTACHMENTS: private bucket. Path convention: <conversation_id>/<uid>-<ts>.<ext>
-- Read/write gated by conversation membership (reuses is_conversation_member).
insert into storage.buckets (id, name, public)
values ('chat-attachments','chat-attachments', false)
on conflict (id) do nothing;

create policy "chatatt_member_read" on storage.objects for select to authenticated
  using (
    bucket_id = 'chat-attachments'
    and public.is_conversation_member(((storage.foldername(name))[1])::uuid)
  );
create policy "chatatt_member_write" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'chat-attachments'
    and public.is_conversation_member(((storage.foldername(name))[1])::uuid)
  );

-- 2) RATE LIMITING (abuse guard; real per-IP limiting stays at the edge).
-- Generic BEFORE INSERT trigger: args = max_count, window_seconds, actor_column.
create or replace function public.rate_limit_check()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  cnt int;
  max_count int := tg_argv[0]::int;
  window_sec int := tg_argv[1]::int;
begin
  -- service-role / trigger-internal writes bypass (no JWT)
  if actor is null then return new; end if;
  execute format(
    'select count(*) from %I.%I where %I = $1 and created_at > now() - make_interval(secs => $2)',
    tg_table_schema, tg_table_name, tg_argv[2]
  ) into cnt using actor, window_sec;
  if cnt >= max_count then
    raise exception 'Too many requests — please slow down.' using errcode = 'P0001';
  end if;
  return new;
end $$;
revoke execute on function public.rate_limit_check() from anon, authenticated, public;

create trigger trg_rl_posts before insert on public.posts
  for each row execute function public.rate_limit_check('10','600','author_id');
create trigger trg_rl_comments before insert on public.comments
  for each row execute function public.rate_limit_check('30','600','author_id');
create trigger trg_rl_messages before insert on public.messages
  for each row execute function public.rate_limit_check('60','60','sender_id');
create trigger trg_rl_reactions before insert on public.reactions
  for each row execute function public.rate_limit_check('120','60','user_id');
create trigger trg_rl_friendships before insert on public.friendships
  for each row execute function public.rate_limit_check('30','600','requester_id');
create trigger trg_rl_notifications before insert on public.notifications
  for each row execute function public.rate_limit_check('60','60','sender_id');
create trigger trg_rl_conversations before insert on public.conversations
  for each row execute function public.rate_limit_check('20','600','created_by');

-- 3) MAP: viewport (bounding-box) query instead of fetch-everything.
-- SECURITY INVOKER: profiles RLS applies unchanged.
create or replace function public.users_in_bbox(
  min_lat double precision,
  min_lng double precision,
  max_lat double precision,
  max_lng double precision,
  max_rows integer default 500
)
returns setof public.profiles
language sql
stable
security invoker
set search_path = public
as $$
  select *
  from public.profiles
  where active
    and latitude  between min_lat and max_lat
    and longitude between min_lng and max_lng
  limit least(greatest(coalesce(max_rows, 500), 1), 1000);
$$;
grant execute on function public.users_in_bbox(double precision, double precision, double precision, double precision, integer) to authenticated;
revoke execute on function public.users_in_bbox(double precision, double precision, double precision, double precision, integer) from anon, public;
