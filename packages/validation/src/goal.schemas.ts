import { z } from 'zod';
import { GoalCategory } from '@mindfuel/types';

export const createGoalSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.nativeEnum(GoalCategory),
  target_date: z.string().datetime().optional(),
});

export const updateGoalSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  category: z.nativeEnum(GoalCategory).optional(),
  target_date: z.string().datetime().optional(),
  is_completed: z.boolean().optional(),
});

export const createGoalProgressSchema = z.object({
  goal_id: z.string().uuid(),
  note: z.string().min(1),
  progress_percentage: z.number().min(0).max(100),
});
