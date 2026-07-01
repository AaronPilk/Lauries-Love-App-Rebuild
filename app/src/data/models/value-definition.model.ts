import { BaseModel, DefinitionType } from 'domain/models/base.model';

export type ValueDefinition = BaseModel & {
  valueDefinition: string;
  description: string;
  validationType?: string;
  modifierUserId?: string;
  definitionType: DefinitionType;
  id?: string;
};
