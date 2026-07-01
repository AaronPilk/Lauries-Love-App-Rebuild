import { RemoteStorage } from 'data/usecases';

export const makeRemoteStorageAdapter = (): RemoteStorage => {
  return new RemoteStorage();
};
