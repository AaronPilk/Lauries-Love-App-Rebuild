import { appConfig } from 'main/config/app.config';
import { useQuery } from '@tanstack/react-query';
import { makeAxiosHttpClient } from 'main/factories/http';
import { consoleCustom } from 'utils/other';
import { ValueDefinition } from 'data/models';
import { DefinitionType } from 'domain/models/base.model';

import { RequestKeys } from './queries.model';

export * from 'domain/models/base.model';

export function useGetDefinitions(type: DefinitionType, name?: string) {
  let key = '';

  switch (type) {
    case DefinitionType.diagnosisSubType:
      key = RequestKeys.diagnosisSubTypeList;
      break;
    case DefinitionType.diagnosisType:
      key = RequestKeys.diagnosisTypeList;
      break;
    case DefinitionType.userRole:
      key = RequestKeys.userRolesList;
      break;
    case DefinitionType.designationTypes:
      key = RequestKeys.designationList;
      break;
    case DefinitionType.userNotifications:
      key = RequestKeys.userNotificationTypes;
      break;
  }

  let url = `${appConfig.apiUrl}/valueDefinitions/byTypeAndName?type=${type}`;

  if (name) {
    url += `&name=${name}`;
  }

  return useQuery({
    queryKey: [key],
    queryFn: async (): Promise<ValueDefinition[]> => {
      let response: ValueDefinition[] = [];
      const req = await makeAxiosHttpClient().request({
        method: 'get',
        url,
      });

      if (req.body) {
        const arr = req.body as ValueDefinition[];
        response = arr.sort((a, b) =>
          a.description.localeCompare(b.description),
        );
      }

      return response;
    },
    throwOnError: (err, axiosError) => {
      if (__DEV__) {
        consoleCustom(`GET_VALUE_DEFINITIONS-Error - ${JSON.stringify(err)}`);
        consoleCustom(
          `GET_VALUE_DEFINITIONS-axiosError - ${JSON.stringify(axiosError)}`,
        );
      }
      return false;
    },
    staleTime: 10000,
  });
}
