import { definitionSchema } from 'providers/DBProvider/DBProvider.schemas';
import { z } from 'zod';

export const notificationConfigSchema = z.object({
  notificationToken: z.string(),
  active: z.boolean(),
  deviceType: z.string(),
});

export const billingConfigSchema = z.object({
  billId: z.string(),
  profileId: z.string(),
  paymentProfileId: z.array(z.string()),
});

export const userConfigSchemaDB = z.object({
  notifications: notificationConfigSchema.optional(),
  billing: billingConfigSchema.optional(),
});

export const userDbSchema = z.object({
  id: z.string(),
  cognitoId: z.string(),
  sendBirdId: z.string().optional(),
  email: z.string(),
  firstName: z.string(),
  displayName: z.string().nullable(),
  diagnosisYear: z.string().nullable(),
  designation: definitionSchema.nullable(),
  role: definitionSchema.nullable(),
  lastName: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  profileImgUrl: z.string().nullable().optional(),
  dob: z.string().nullable(),
  addressLine1: z.string().nullable(),
  addressLine2: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  country: z.string().nullable(),
  zipCode: z.string().nullable(),
  geoLocation: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .nullable()
    .optional(),
  diagnosisTypes: z.array(definitionSchema.or(z.string())).nullable(),
  diagnosisSubTypes: z.array(definitionSchema.or(z.string())).nullable(),
  age: z.string().nullable(),
  gender: z.string().nullable(),
  diagnosisDate: z.string().nullable(),
  timeline: z.string().nullable(),
  phoneNumberLocation: z.string().nullable(),
  profilePicture: z.string().nullable(),
  config: userConfigSchemaDB.nullable(),
  description: z.string().nullable(),
});
