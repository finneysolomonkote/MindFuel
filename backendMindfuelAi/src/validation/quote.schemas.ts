import { z } from 'zod';
import { Status } from '../types';

export const createQuoteSchema = z.object({
  text: z.string().min(1, 'Quote text is required'),
  author: z.string().min(1, 'Author is required'),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const updateQuoteSchema = z.object({
  text: z.string().min(1).optional(),
  author: z.string().min(1).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.nativeEnum(Status).optional(),
});
