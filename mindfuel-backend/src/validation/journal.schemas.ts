import { z } from 'zod';
import { JournalMood } from '../types';

export const createJournalSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  mood: z.nativeEnum(JournalMood).optional(),
  tags: z.array(z.string()).optional(),
});

export const updateJournalSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  mood: z.nativeEnum(JournalMood).optional(),
  tags: z.array(z.string()).optional(),
  is_favorite: z.boolean().optional(),
});
