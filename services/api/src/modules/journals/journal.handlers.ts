import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { ApiResponse } from '@mindfuel/types';
import { getSupabase } from '../../lib/supabase';
import { AppError } from '../../middleware/error-handler';

export const listJournals = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const supabase = getSupabase();
    const { data } = await supabase.from('journals').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getJournal = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const supabase = getSupabase();
    const { data } = await supabase.from('journals').select('*').eq('id', id).eq('user_id', userId).single();
    if (!data) throw new AppError(404, 'Journal not found');
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createJournal = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const journalData = req.body;
    const userId = req.user!.id;
    const supabase = getSupabase();
    const { data, error } = await supabase.from('journals').insert({ ...journalData, user_id: userId, is_favorite: false }).select().single();
    if (error) throw new AppError(500, 'Failed to create journal');
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateJournal = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user!.id;
    const supabase = getSupabase();
    const { error } = await supabase.from('journals').update(updates).eq('id', id).eq('user_id', userId);
    if (error) throw new AppError(500, 'Failed to update journal');
    res.json({ success: true, message: 'Journal updated' });
  } catch (error) {
    next(error);
  }
};

export const deleteJournal = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const supabase = getSupabase();
    const { error } = await supabase.from('journals').delete().eq('id', id).eq('user_id', userId);
    if (error) throw new AppError(500, 'Failed to delete journal');
    res.json({ success: true, message: 'Journal deleted' });
  } catch (error) {
    next(error);
  }
};
