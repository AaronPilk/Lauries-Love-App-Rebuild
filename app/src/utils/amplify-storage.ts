// Legacy S3 (Amplify Storage) — RETIRED. Media now lives in Supabase Storage
// (services/supabase/supabase.storage.ts). These stubs keep the old call
// sites compiling; they are only reached for legacy S3 paths that no longer
// exist, where callers already handle an undefined/false result by falling
// back to defaults.

export const getFileStorageAmplify = async (
  _path: string,
  _options?: any,
): Promise<{ href: string } | undefined> => undefined;

export const removeFileStorageAmplify = async (_path: string) => false;

export const uploadFileStorageAmplify = async (_path: string, _data: any) =>
  false as const;
