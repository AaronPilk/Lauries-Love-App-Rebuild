import { z } from 'zod';
import { ToastSchema } from './ToastProvider.schemas';

export type ToastType = z.infer<typeof ToastSchema>;
