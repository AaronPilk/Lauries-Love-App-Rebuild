export interface FileStorageConfig {
  level?: 'public' | 'private' | 'protected';
  download?: boolean;
  contentType?: string;
  cacheControl?: string;
  expires?: any;
}

export interface FileStorage {
  getFile: (key: string, config: FileStorageConfig) => Promise<unknown>;
  removeFile: (key: string, config: FileStorageConfig) => Promise<unknown>;
  uploadFile: (
    key: string,
    file: Blob,
    config: FileStorageConfig,
  ) => Promise<unknown>;
}
