import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { ApiResponse } from '../../types';
import { getSupabase } from '../../lib/supabase';
import { AppError } from '../../middleware/error-handler';

export const getAllPractices = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const { category, difficulty } = req.query;
    const supabase = getSupabase();

    let query = supabase
      .from('guided_practices')
      .select('*')
      .eq('is_active', true);

    if (category) {
      query = query.eq('category', category);
    }

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw new AppError(500, 'Failed to fetch practices');

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getPracticeById = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const supabase = getSupabase();

    const { data: practice, error } = await supabase
      .from('guided_practices')
      .select('*, practice_steps(*)')
      .eq('id', id)
      .single();

    if (error) throw new AppError(404, 'Practice not found');

    res.json({ success: true, data: practice });
  } catch (error) {
    next(error);
  }
};

export const startPracticeSession = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { practice_id } = req.body;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('practice_sessions')
      .insert({
        user_id: userId,
        practice_id,
        status: 'in_progress',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new AppError(500, 'Failed to start practice session');

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const completePracticeSession = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { sessionId } = req.params;
    const { completion_notes, mood_after } = req.body;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('practice_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        completion_notes,
        mood_after,
      })
      .eq('id', sessionId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new AppError(500, 'Failed to complete practice session');

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const savePracticeAnswer = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { session_id, step_id, answer_text } = req.body;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('practice_answers')
      .insert({
        user_id: userId,
        session_id,
        step_id,
        answer_text,
      })
      .select()
      .single();

    if (error) throw new AppError(500, 'Failed to save answer');

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getUserPracticeSessions = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('practice_sessions')
      .select('*, guided_practices(title, category)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new AppError(500, 'Failed to fetch practice sessions');

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createPractice = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const practiceData = req.body;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('guided_practices')
      .insert(practiceData)
      .select()
      .single();

    if (error) throw new AppError(500, 'Failed to create practice');

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updatePractice = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const practiceData = req.body;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('guided_practices')
      .update(practiceData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError(500, 'Failed to update practice');

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const deletePractice = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const supabase = getSupabase();

    const { error } = await supabase
      .from('guided_practices')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw new AppError(500, 'Failed to delete practice');

    res.json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
};
