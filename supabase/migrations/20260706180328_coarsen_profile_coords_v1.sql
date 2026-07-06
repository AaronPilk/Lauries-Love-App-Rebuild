-- PRIVACY (review 2026-07-06 finding): profiles is directly selectable by any
-- authenticated user (`profiles_select using (active)`), so whatever is STORED
-- in latitude/longitude is effectively public to the community. users_in_bbox
-- already coarsened on read, but the direct-table path served full-precision
-- home coordinates. Fix: coarsen to 2 decimal places (~1.1 km) at WRITE time
-- via trigger + backfill, so exact coordinates never exist in this table.

create or replace function public.coarsen_profile_coords()
returns trigger language plpgsql
set search_path = public
as $$
begin
  if new.latitude is not null then
    new.latitude := round(new.latitude::numeric, 2)::double precision;
  end if;
  if new.longitude is not null then
    new.longitude := round(new.longitude::numeric, 2)::double precision;
  end if;
  return new;
end $$;
revoke execute on function public.coarsen_profile_coords() from anon, authenticated, public;

drop trigger if exists trg_profiles_coarsen_coords on public.profiles;
create trigger trg_profiles_coarsen_coords
  before insert or update of latitude, longitude on public.profiles
  for each row execute function public.coarsen_profile_coords();

update public.profiles
set latitude  = round(latitude::numeric, 2)::double precision,
    longitude = round(longitude::numeric, 2)::double precision
where latitude is not null or longitude is not null;
