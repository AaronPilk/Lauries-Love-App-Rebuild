import { RouteProp } from '@react-navigation/native';
import { DonateStackParamList } from 'types/navigation';

import { z } from 'zod';

export type DonateRouteProps<RouteName extends keyof DonateStackParamList> =
  RouteProp<DonateStackParamList, RouteName>;

export const validateSchema = z
  .object({
    paymentType: z.string(),
    inHonorName: z.string().min(4).optional(),
    inHonor: z.boolean(),
    address: z.string().min(4),
    amount: z.preprocess(a => parseInt(a as string, 10), z.number().positive()),
    creditCard: z.object({
      cardHolderName: z.string().min(4),
      cardNumber: z.object({
        masked: z.string().min(16),
        unmasked: z.string().min(16),
      }),
      expirationDate: z.object({
        masked: z.string().min(5),
        unmasked: z.string().min(4),
      }),
      cvv: z.object({
        masked: z.string().min(3),
        unmasked: z.string().min(3),
      }),
    }),
    remember: z.boolean().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.inHonor) {
      // If checkbox is true, make the textField required

      if (!value?.inHonorName || value.inHonorName.length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Is required',
          fatal: true,
        });
      }
      return z.NEVER;
    }
  });

export type CreatePaymentModel = z.infer<typeof validateSchema>;
