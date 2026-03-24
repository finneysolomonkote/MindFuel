import { Status } from './common';

export enum GoalCategory {
  PERSONAL = 'personal',
  PROFESSIONAL = 'professional',
  HEALTH = 'health',
  RELATIONSHIPS = 'relationships',
  FINANCIAL = 'financial',
  SPIRITUAL = 'spiritual',
  OTHER = 'other',
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: GoalCategory;
  target_date?: string;
  status: Status;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateGoalDto {
  title: string;
  description: string;
  category: GoalCategory;
  target_date?: string;
}

export interface UpdateGoalDto {
  title?: string;
  description?: string;
  category?: GoalCategory;
  target_date?: string;
  is_completed?: boolean;
}

export interface GoalProgress {
  id: string;
  goal_id: string;
  note: string;
  progress_percentage: number;
  created_at: string;
}

export interface CreateGoalProgressDto {
  goal_id: string;
  note: string;
  progress_percentage: number;
}
