import * as Storage from '@aws-amplify/storage';
import { FileStorage, FileStorageConfig } from 'domain/usecases';

export class RemoteStorage implements FileStorage {
  async getFile(key: string, config?: FileStorageConfig) {
    return Storage.get(key, config);
  }
  async removeFile(key: string) {
    return Storage.remove(key);
  }
  async uploadFile(key: string, file: Blob, config: FileStorageConfig) {
    return Storage.put(key, file, config);
  }
}
