-- RECONSTRUCTED (review 2026-07-06): this migration was applied to the live
-- project on 2026-07-06 but was never committed, leaving the repo one
-- migration behind the database. Content reconstructed from the live schema:
-- the PostGIS trial (geography column + GiST index) was rolled back because
-- installing PostGIS into the `public` schema trips a Supabase security ERROR.
-- Verified live 2026-07-06: no postgis extension installed, users_in_bbox is
-- the btree(lat,lng) version with coarsened coords + hidden last_name.
--
-- Everything here is idempotent — a fresh `db push` that already applied
-- 20260706015837 lands in the same state.

drop index if exists public.idx_profiles_geo_gist;
alter table public.profiles drop column if exists geo;
drop extension if exists postgis;

-- Final map RPC: btree bbox range filter, 2dp coords, last_name hidden.
drop function if exists public.users_in_bbox(double precision, double precision, double precision, double precision, integer);
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
  where active
    and latitude between min_lat and max_lat
    and longitude between min_lng and max_lng
  limit least(greatest(coalesce(max_rows, 500), 1), 1000);
$$;
grant execute on function public.users_in_bbox(double precision, double precision, double precision, double precision, integer) to authenticated;
revoke execute on function public.users_in_bbox(double precision, double precision, double precision, double precision, integer) from anon, public;
