-- PERFORMANCE: denormalized like_count on posts (trigger-maintained) so the
-- feed never ships unbounded liker-id arrays.
alter table public.posts add column if not exists like_count integer not null default 0;
update public.posts p set like_count = (
  select count(*) from public.reactions r
  where r.entity_type = 'post' and r.entity_id = p.id
);
create or replace function public.bump_post_like_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' and new.entity_type = 'post' then
    update public.posts set like_count = like_count + 1 where id = new.entity_id;
  elsif tg_op = 'DELETE' and old.entity_type = 'post' then
    update public.posts set like_count = greatest(like_count - 1, 0) where id = old.entity_id;
  end if;
  return null;
end $$;
revoke execute on function public.bump_post_like_count() from anon, authenticated, public;
drop trigger if exists trg_reactions_post_count on public.reactions;
create trigger trg_reactions_post_count
  after insert or delete on public.reactions
  for each row execute function public.bump_post_like_count();

-- PRIVACY: coarsen public coordinates (~1km) + drop last_name from the map.
drop function public.users_in_bbox(double precision, double precision, double precision, double precision, integer);
create function public.users_in_bbox(
  min_lat double precision, min_lng double precision,
  max_lat double precision, max_lng double precision,
  max_rows integer default 500
)
returns table (
  id uuid, first_name text, last_name text, display_name text, avatar_path text,
  role_id uuid, diagnosis_type_ids uuid[], diagnosis_subtype_ids uuid[],
  diagnosis_year text, age_range text, gender text, city text, state text,
  country text, latitude double precision, longitude double precision,
  active boolean, created_at timestamptz
)
language sql stable security invoker set search_path = public as $$
  select id, first_name, null::text as last_name, display_name, avatar_path,
         role_id, diagnosis_type_ids, diagnosis_subtype_ids, diagnosis_year,
         age_range, gender, city, state, country,
         round(latitude::numeric, 2)::double precision as latitude,
         round(longitude::numeric, 2)::double precision as longitude,
         active, created_at
  from public.profiles
  where active and latitude between min_lat and max_lat
    and longitude between min_lng and max_lng
  limit least(greatest(coalesce(max_rows, 500), 1), 1000);
$$;
grant execute on function public.users_in_bbox(double precision, double precision, double precision, double precision, integer) to authenticated;
revoke execute on function public.users_in_bbox(double precision, double precision, double precision, double precision, integer) from anon, public;

-- SECURITY: post-images (may contain treatment/diagnosis photos) -> private
-- bucket; client renders via short-lived signed URLs. Avatars stay public.
update storage.buckets set public = false where id = 'post-images';
drop policy if exists "postimages_read" on storage.objects;
create policy "postimages_member_read" on storage.objects for select to authenticated
  using (bucket_id = 'post-images');
