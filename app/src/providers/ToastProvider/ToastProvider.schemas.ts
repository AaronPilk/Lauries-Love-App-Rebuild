import { z } from 'zod';

export const ToastSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  message: z.string(),
  type: z.enum(['info', 'success', 'error']),
  interval: z.number().min(1000).default(3000).optional(),
  position: z.enum(['top', 'bottom']).default('bottom').optional(),
});
