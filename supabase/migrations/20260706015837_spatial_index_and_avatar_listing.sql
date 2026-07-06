-- SECURITY: drop the broad avatars SELECT policy so authenticated clients can't
-- LIST/enumerate every avatar path (= every user UUID). Public buckets still
-- serve object URLs without a SELECT policy, so avatar rendering is unaffected.
drop policy if exists "avatars_read" on storage.objects;

-- MAP: keep the btree(lat,lng)-backed bbox with coarsened coords + hidden
-- last_name. (A PostGIS/GiST spatial index was trialed and reverted — it forced
-- PostGIS into the public schema, which trips a security ERROR on Supabase.
-- Proper spatial indexing = a 250k-scale-phase task: install PostGIS into a
-- dedicated 'extensions' schema, add a geography column + GiST index there.)
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
