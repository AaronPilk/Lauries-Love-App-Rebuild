// Media pipeline on Supabase Storage (replaces S3 presigned URLs).
// Buckets: 'avatars', 'post-images' — public read, owner-scoped writes
// (object path MUST start with the uploader's uid; enforced by policy).

import { supabase } from './client';

const extFromUri = (uri: string) => {
  const clean = uri.split('?')[0];
  const ext = clean.includes('.') ? clean.split('.').pop()! : 'jpg';
  return ext.length <= 5 ? ext.toLowerCase() : 'jpg';
};

const contentTypeFor = (ext: string) =>
  ext === 'png'
    ? 'image/png'
    : ext === 'gif'
      ? 'image/gif'
      : ext === 'webp'
        ? 'image/webp'
        : ext === 'heic'
          ? 'image/heic'
          : 'image/jpeg';

/**
 * Upload a local image (file:// uri from the image picker) to a bucket.
 * Returns the storage PATH (store this in the DB) — use publicUrlFor() to
 * render it.
 */
export async function uploadImage(
  bucket: 'avatars' | 'post-images',
  localUri: string,
): Promise<string> {
  const { data: auth } = await supabase.auth.getUser();
  const me = auth.user?.id;
  if (!me) throw new Error('Not authenticated');

  const ext = extFromUri(localUri);
  const path = `${me}/${Date.now()}.${ext}`;

  // RN: fetch the local file into an ArrayBuffer (Blob upload is unreliable
  // across RN versions; arraybuffer works with supabase-js).
  const resp = await fetch(localUri);
  const arrayBuffer = await resp.arrayBuffer();

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, arrayBuffer, {
      contentType: contentTypeFor(ext),
      upsert: false,
    });
  if (error) throw error;

  return path;
}

/** Upload from a base64 string (the image picker's output). */
export async function uploadImageBase64(
  bucket: 'avatars' | 'post-images',
  base64: string,
  ext: string,
): Promise<string> {
  const { data: auth } = await supabase.auth.getUser();
  const me = auth.user?.id;
  if (!me) throw new Error('Not authenticated');

  const cleanExt = (ext || 'jpg').replace('.', '').toLowerCase();
  const path = `${me}/${Date.now()}.${cleanExt}`;
  const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

  const { error } = await supabase.storage.from(bucket).upload(path, bytes, {
    contentType: contentTypeFor(cleanExt),
    upsert: false,
  });
  if (error) throw error;
  return path;
}

/** Public URL for a stored path (or pass through anything already a URL). */
export function publicUrlFor(
  bucket: 'avatars' | 'post-images',
  path: string | null | undefined,
): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl ?? null;
}
