export interface GetStorage<T> {
  get: (key: string) => T;
}
