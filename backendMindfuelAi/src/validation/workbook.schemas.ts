import { z } from 'zod';
import { Status } from '../types';

export const createWorkbookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  author: z.string().min(1, 'Author is required'),
  cover_image_url: z.string().url('Invalid cover image URL'),
  file_url: z.string().url().optional(),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()),
  is_free: z.boolean(),
});

export const updateWorkbookSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  author: z.string().min(1).optional(),
  cover_image_url: z.string().url().optional(),
  file_url: z.string().url().optional(),
  category: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  is_free: z.boolean().optional(),
  status: z.nativeEnum(Status).optional(),
});

export const createChapterSchema = z.object({
  workbook_id: z.string().uuid(),
  chapter_number: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string().optional(),
  content: z.string().optional(),
});

export const createSectionSchema = z.object({
  chapter_id: z.string().uuid(),
  section_number: z.number().int().positive(),
  title: z.string().min(1),
  content: z.string().min(1),
  page_number: z.number().int().positive().optional(),
});
