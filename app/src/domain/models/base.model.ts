export type BaseModel = {
  id: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ValuesDefinition = BaseModel & {
  valueDefinition: string;
  description: string;
  validationType?: string;
  creatorUserId?: string;
  modifierUserId?: string;
  definitionType: DefinitionsType;
};

export type DefinitionsType = BaseModel & {
  definitionType: string;
  description?: string;
  creatorUserId?: string;
};

export enum DefinitionType {
  diagnosisType = 'DIAGNOSIS_TYPE',
  diagnosisSubType = 'DIAGNOSIS_SUB_TYPE',
  userRole = 'USER_ROLE',
  designationTypes = 'USER_DESIGNATION',
  userNotifications = 'USER_NOTIFICATIONS',
}
