// Legacy S3 (Amplify Storage) — RETIRED. Media lives in Supabase Storage.
// In supabase mode every file/attachment reference is already a full
// (public or signed) URL, so getFile is a pass-through; legacy S3 keys no
// longer resolve anywhere and return ''.
import { FileStorage, FileStorageConfig } from 'domain/usecases';

export class RemoteStorage implements FileStorage {
  async getFile(key: string, _config?: FileStorageConfig): Promise<any> {
    return key?.startsWith('http') ? key : '';
  }
  async removeFile(_key: string): Promise<any> {
    return true;
  }
  async uploadFile(
    _key: string,
    _file: Blob,
    _config: FileStorageConfig,
  ): Promise<any> {
    return '';
  }
}
