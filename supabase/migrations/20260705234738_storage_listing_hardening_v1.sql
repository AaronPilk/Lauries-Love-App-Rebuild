-- Advisor: public buckets shouldn't grant a broad SELECT (enables .list()
-- enumeration). Public-URL GET on a public bucket bypasses RLS, so tightening
-- these SELECT policies to authenticated does NOT break avatar/post-image
-- rendering — it only stops anonymous bucket listing/enumeration.
-- (This migration was applied to the live project and is committed here to
--  reconcile repo↔DB; a later migration further narrows post-images.)
drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_read" on storage.objects for select to authenticated
  using (bucket_id = 'avatars');

drop policy if exists "postimages_public_read" on storage.objects;
create policy "postimages_read" on storage.objects for select to authenticated
  using (bucket_id = 'post-images');
