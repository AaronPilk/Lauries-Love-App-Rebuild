import { z } from 'zod';
import { dbSchema, definitionSchema } from './DBProvider.schemas';

export type DefinitionType = z.infer<typeof definitionSchema>;

export type DBType = z.infer<typeof dbSchema>;

export enum DefinitionsType {
  diagnosisType = 'DIAGNOSIS_TYPE',
  diagnosisSubType = 'DIAGNOSIS_SUB_TYPE',
  userRole = 'USER_ROLE',
  designationTypes = 'USER_DESIGNATION',
  userNotifications = 'USER_NOTIFICATIONS',
}
