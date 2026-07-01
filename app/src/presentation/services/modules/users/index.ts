import { api } from '../../api';
import { User } from 'data/models';

export const userApi = api.injectEndpoints({
  endpoints: build => ({
    fetchOne: build.query<User, string>({
      query: id => `/users/${id}`,
    }),
  }),
  overrideExisting: false,
});

export const { useLazyFetchOneQuery } = userApi;
