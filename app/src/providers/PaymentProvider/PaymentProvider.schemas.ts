import { definitionSchema } from 'providers/DBProvider/DBProvider.schemas';
import { userDbSchema } from 'providers/UserDBProvider/UserDBProvider.schemas';
import { z } from 'zod';


export const paymentItemSchema = z.object({
  name: z.string(),
  type: z.string(),
  price: z.number(),
  quantity: z.number(),
});


export const paymentSchema = z.object({
  id: z.string(),
  active: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  paymentId: z.string(),
  description: z.string().nullable(),
  accountType: z.string(),
  accountNumber: z.string(),
  paymentStatus: z.string(),
  items: z.array(paymentItemSchema),
  amount: z.number(),
  paymentType: definitionSchema,
  user: userDbSchema,
});

export const paymentProfileSchema = z.object({
  accountNumber: z.string(),
  accountType: z.string(),
  expirationDate: z.string(),
  paymentProfileId: z.string(),
});

export const paymentProfilesSchema = z.array(paymentProfileSchema);
  