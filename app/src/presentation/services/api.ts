// import {
//   BaseQueryFn,
//   FetchArgs,
//   createApi,
//   fetchBaseQuery,
//   FetchBaseQueryError,
// } from '@reduxjs/toolkit/query/react';
// import { appConfig } from 'main/config/app.config';

// const baseQuery = fetchBaseQuery({
//   baseUrl: appConfig.apiUrl,
// });

// const baseQueryWithInterceptor: BaseQueryFn<
//   string | FetchArgs,
//   unknown,
//   FetchBaseQueryError
// > = async (args, api, extraOptions) => {
//   let result = await baseQuery(args, api, extraOptions);
//   if (result.error && result.error.status === 401) {
//   }
//   return result;
// };

// export const api = createApi({
//   baseQuery: baseQueryWithInterceptor,
//   endpoints: () => ({}),
// });
