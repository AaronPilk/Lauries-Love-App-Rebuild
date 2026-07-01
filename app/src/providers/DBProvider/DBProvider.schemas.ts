import { z } from 'zod';

export const definitionSchema = z.object({
  id: z.string(),
  active: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  valueDefinition: z.string(),
  description: z.string(),
  validationType: z.nullable(z.string()),
  creatorUserId: z.string(),
  modifierUserId: z.nullable(z.string()),
  definitionType: z
    .object({
      id: z.string(),
      active: z.boolean(),
      createdAt: z.string(),
      updatedAt: z.string(),
      definitionType: z.string(),
      description: z.string(),
      creatorUserId: z.string(),
    })
    .optional(),
});

export const dbSchema = z.object({
  diagnosisType: z.array(definitionSchema),
  diagnosisSubType: z.array(definitionSchema),
  userRole: z.array(definitionSchema),
  designationTypes: z.array(definitionSchema),
  userNotifications: z.array(definitionSchema),
});
