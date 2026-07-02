import { appConfig } from 'main/config/app.config';
import { useQuery } from '@tanstack/react-query';
import { makeAxiosHttpClient } from 'main/factories/http';
import { consoleCustom } from 'utils/other';
import { ValueDefinition } from 'data/models';

import { RequestKeys } from './queries.model';

export const useGetDesignations = () => {
  const url = `${appConfig.apiUrl}/valueDefinitions/byTypeAndName?type=USER_DESIGNATION`;
  return useQuery({
    queryKey: [RequestKeys.designationList],
    queryFn: async (): Promise<ValueDefinition[]> => {
      const req = await makeAxiosHttpClient().request({
        method: 'get',
        url,
      });
      return req.body as ValueDefinition[];
    },
    throwOnError: (err, axiosError) => {
      if (__DEV__)
        consoleCustom(
          `ERROR_GET_DESIGNATIONS: ${JSON.stringify(err)}, ${JSON.stringify(
            axiosError,
          )}`,
        );

      return false;
    },
    // Static reference data — match the 5-min global default instead of 10s.
    staleTime: 5 * 60 * 1000,
  });
};
