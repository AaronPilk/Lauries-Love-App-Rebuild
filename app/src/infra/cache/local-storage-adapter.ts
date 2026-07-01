import { SetStorage, GetStorage } from 'data/protocols/cache';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

export class LocalStorageAdapter implements SetStorage<any>, GetStorage<any> {
  set(key: string, value: any): void {
    if (value) {
      storage.set(key, value);
    } else {
      storage.delete(key);
    }
  }

  get(key: string): any {
    return storage.getString(key);
  }
}
