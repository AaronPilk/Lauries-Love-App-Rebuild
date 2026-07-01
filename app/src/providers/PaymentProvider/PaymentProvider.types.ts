import { z } from 'zod';
import { paymentSchema, paymentProfileSchema } from './PaymentProvider.schemas';

export type PaymentSchema = z.infer<typeof paymentSchema>;
export type PaymentProfileSchema = z.infer<typeof paymentProfileSchema>;
