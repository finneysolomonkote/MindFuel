import { z } from 'zod';
import { NotificationType } from '../types';

export const createNotificationSchema = z.object({
  user_id: z.string().uuid(),
  title: z.string().min(1),
  body: z.string().min(1),
  type: z.nativeEnum(NotificationType),
  data: z.record(z.any()).optional(),
});

export const registerDeviceSchema = z.object({
  device_token: z.string().min(1),
  device_type: z.enum(['ios', 'android']),
});
