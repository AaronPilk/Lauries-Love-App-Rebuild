import { z } from 'zod';
import { captureException } from '@sentry/react-native';
import React, {
  createContext,
  FunctionComponent,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { customShowError } from 'utils/other';
import { definitionSchema } from './DBProvider.schemas';
import { DBType, DefinitionsType } from './DBProvider.types';
import { useApiProvider } from 'providers/ApiProvider/ApiProvider';
import { useToastProvider } from 'providers/ToastProvider/ToastProvider';
import {
  DEFAULT_DESIGNATION_SUPER_ADMIN,
  DEFAULT_DESIGNATIONS_DB,
  DEFINITION_TYPES,
} from './DBProvider.constants';

type DBContext = {
  db: DBType;
};

type DBProviderProps = {
  children: React.ReactNode;
};

export const dbContext = createContext({} as DBContext);

const DBProvider: FunctionComponent<DBProviderProps> = ({ children }) => {
  const { api } = useApiProvider();
  const { showToast } = useToastProvider();
  const [db, setDB] = useState<DBType>(DEFAULT_DESIGNATIONS_DB);

  const getDefinitions = async () => {
    try {
      const results = await Promise.all(
        DEFINITION_TYPES.map(async type => ({
          type,
          result: await api(`/valueDefinitions/byTypeAndName?type=${type}`, {
            schema: z.array(definitionSchema),
          }),
        })),
      );
      if (!results) return;

      const newDB = results.reduce<DBType>((acc, { type, result }) => {
        if (!result) return acc;
        if (type === DefinitionsType.designationTypes) {
          const definitions = result.sort((a, b) => {
            if (a.description === 'Warrior (patient)') return -1;
            if (b.description === 'Warrior (patient)') return 1;
            return a.description.localeCompare(b.description);
          });
          return {
            ...acc,
            designationTypes: __DEV__
              ? [...definitions, DEFAULT_DESIGNATION_SUPER_ADMIN]
              : definitions,
          };
        }
        if (type === DefinitionsType.diagnosisSubType) {
          const definitions = {
            ...acc,
            diagnosisSubType: result,
          };

          definitions.diagnosisSubType.sort((a, b) =>
            a.description.localeCompare(b.description),
          );
          return definitions;
        }
        if (type === DefinitionsType.diagnosisType) {
          const definitions = {
            ...acc,
            diagnosisType: result,
          };

          definitions.diagnosisType.sort((a, b) => {
            if (a.description === 'No Preference') return -1;
            if (b.description === 'No Preference') return 1;
            if (a.description === 'Other') return 1;
            if (b.description === 'Other') return -1;
            return a.description.localeCompare(b.description);
          });

          return definitions;
        }
        if (type === DefinitionsType.userNotifications)
          return {
            ...acc,
            userNotifications: result,
          };
        if (type === DefinitionsType.userRole) {
          const roles = result.sort((a, b) => {
            if (a.description === 'Warrior (patient)') return -1;
            if (b.description === 'Warrior (patient)') return 1;
            return a.description.localeCompare(b.description);
          });
          return {
            ...acc,
            userRole: roles,
          };
        }
        return acc;
      }, DEFAULT_DESIGNATIONS_DB);

      setDB(prev => ({
        ...prev,
        ...newDB,
      }));
    } catch (error) {
      customShowError({
        error,
        showToast,
      });
      captureException(error);
    }
  };

  useEffect(() => {
    getDefinitions();
  }, []);

  const value = useMemo(() => ({ db }), [db]);

  return <dbContext.Provider value={value}>{children}</dbContext.Provider>;
};

export const useDBProvider = () => useContext(dbContext);

export default DBProvider;
