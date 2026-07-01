import { DefinitionType, DefinitionsType } from './DBProvider.types';

export const DEFAULT_DESIGNATIONS_DB = {
  diagnosisType: [],
  diagnosisSubType: [],
  userRole: [],
  designationTypes: [],
  userNotifications: [],
};

export const DEFAULT_DESIGNATION_SUPER_ADMIN: DefinitionType = {
  id: 'c467189d-6081-48d8-9aed-4f92cf394022',
  active: true,
  createdAt: '2023-04-24T20:24:30.441Z',
  updatedAt: '2023-04-24T20:24:30.441Z',
  valueDefinition: '030',
  description: 'Super Admin',
  validationType: null,
  creatorUserId: 'laurieslove-app',
  modifierUserId: null,
  definitionType: {
    id: '44b6f87a-1f91-4698-bdd4-70454ad4a46d',
    active: true,
    createdAt: '2023-04-24T20:24:30.432Z',
    updatedAt: '2023-04-24T20:24:30.432Z',
    description: 'Group of values for user roles',
    creatorUserId: 'laurieslove-app',
    definitionType: 'USER_ROLE',
  },
};

export const DEFINITION_TYPES: Array<DefinitionsType> = [
  DefinitionsType.diagnosisType,
  DefinitionsType.diagnosisSubType,
  DefinitionsType.userRole,
  DefinitionsType.designationTypes,
  DefinitionsType.userNotifications,
];
