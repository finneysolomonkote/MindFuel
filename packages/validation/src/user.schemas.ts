import { z } from 'zod';

export const updateUserSchema = z.object({
  full_name: z.string().min(2).optional(),
  phone_number: z.string().optional(),
  profile_image_url: z.string().url().optional(),
});

export const updatePasswordSchema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(8),
});
