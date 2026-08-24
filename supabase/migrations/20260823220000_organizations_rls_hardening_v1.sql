-- Close the organizations RLS gap (audit 2026-08-23).
-- admin_foundation_core_v1 created public.organizations WITHOUT enabling RLS,
-- so a fresh deploy from these migrations leaves the table fully open — any
-- anon/authenticated caller could read it and, via the ON DELETE CASCADE from
-- platform_features / moderation_queue / custom_profile_fields /
-- profile_field_values / branding_settings / org_settings, a single DELETE
-- could wipe all admin config and every member's custom-field values.
--
-- Production had RLS enabled out-of-band but with NO policies (locked); staging
-- (built purely from the repo) had it OFF. This migration converges both on
-- explicit, version-controlled policies. Idempotent.

alter table public.organizations enable row level security;

drop policy if exists organizations_select on public.organizations;
create policy organizations_select on public.organizations
  for select to authenticated using (true);

drop policy if exists organizations_owner_write on public.organizations;
create policy organizations_owner_write on public.organizations
  for all to authenticated
  using (public.is_support_owner()) with check (public.is_support_owner());
