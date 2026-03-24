import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { ApiResponse } from '../../types';
import { getSupabase } from '../../lib/supabase';
import { AppError } from '../../middleware/error-handler';

export const listGoals = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const supabase = getSupabase();
    const { data } = await supabase.from('goals').select('*').eq('user_id', userId).eq('status', 'active').order('created_at', { ascending: false });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getGoal = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const supabase = getSupabase();
    const { data } = await supabase.from('goals').select('*').eq('id', id).eq('user_id', userId).single();
    if (!data) throw new AppError(404, 'Goal not found');
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createGoal = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const goalData = req.body;
    const userId = req.user!.id;
    const supabase = getSupabase();
    const { data, error } = await supabase.from('goals').insert({ ...goalData, user_id: userId, status: 'active', is_completed: false }).select().single();
    if (error) throw new AppError(500, 'Failed to create goal');
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateGoal = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user!.id;
    const supabase = getSupabase();
    const { error } = await supabase.from('goals').update(updates).eq('id', id).eq('user_id', userId);
    if (error) throw new AppError(500, 'Failed to update goal');
    res.json({ success: true, message: 'Goal updated' });
  } catch (error) {
    next(error);
  }
};

export const deleteGoal = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const supabase = getSupabase();
    const { error } = await supabase.from('goals').update({ status: 'deleted' }).eq('id', id).eq('user_id', userId);
    if (error) throw new AppError(500, 'Failed to delete goal');
    res.json({ success: true, message: 'Goal deleted' });
  } catch (error) {
    next(error);
  }
};

export const addProgress = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const progressData = req.body;
    const supabase = getSupabase();
    const { data, error } = await supabase.from('goal_progress').insert(progressData).select().single();
    if (error) throw new AppError(500, 'Failed to add progress');
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
