import { z } from 'zod';
import { ProductType, Status } from '@mindfuel/types';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  product_type: z.nativeEnum(ProductType),
  workbook_id: z.string().uuid().optional(),
  price: z.number().positive('Price must be positive'),
  currency: z.string().default('INR'),
  image_url: z.string().url().optional(),
  features: z.array(z.string()),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  image_url: z.string().url().optional(),
  features: z.array(z.string()).optional(),
  status: z.nativeEnum(Status).optional(),
});
