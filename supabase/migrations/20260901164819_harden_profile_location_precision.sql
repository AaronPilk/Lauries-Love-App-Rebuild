-- Audit Pass 1 CRITICAL (location half): exact member coordinates must never be
-- stored in the world-readable profiles table. Round to ~1km (2 decimals),
-- matching the Community Map's advertised "~1km approximate" privacy model.
-- No app changes required: the map RPC (users_in_bbox) and Connect list already
-- treat location as approximate. Diagnosis visibility is a separate product
-- decision and is intentionally NOT changed here.

-- 1) One-time backfill: round any existing exact coordinates.
update public.profiles
set latitude  = round(latitude::numeric, 2)::double precision,
    longitude = round(longitude::numeric, 2)::double precision
where latitude is not null or longitude is not null;

-- 2) Enforce on every insert/update of coordinates.
create or replace function public.round_profile_coords()
returns trigger
language plpgsql
as $$
begin
  if new.latitude is not null then
    new.latitude := round(new.latitude::numeric, 2)::double precision;
  end if;
  if new.longitude is not null then
    new.longitude := round(new.longitude::numeric, 2)::double precision;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_round_profile_coords on public.profiles;
create trigger trg_round_profile_coords
  before insert or update of latitude, longitude on public.profiles
  for each row execute function public.round_profile_coords();
