import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { ApiResponse } from '../../types';
import { getSupabase } from '../../lib/supabase';
import { AppError } from '../../middleware/error-handler';

export const getDailyQuote = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const supabase = getSupabase();
    const today = new Date().toISOString().split('T')[0];

    const { data: dailyQuote } = await supabase.from('daily_quotes').select('*, quotes(*)').eq('date', today).maybeSingle();

    if (dailyQuote) {
      return res.json({ success: true, data: dailyQuote.quotes });
    }

    const { data: randomQuote } = await supabase.from('quotes').select('*').eq('status', 'active').limit(1).maybeSingle();

    if (randomQuote) {
      await supabase.from('daily_quotes').insert({ quote_id: randomQuote.id, date: today });
    }

    res.json({ success: true, data: randomQuote });
  } catch (error) {
    next(error);
  }
};

export const listQuotes = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const supabase = getSupabase();
    const { data } = await supabase.from('quotes').select('*').order('created_at', { ascending: false });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createQuote = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const quoteData = req.body;
    const userId = req.user!.id;
    const supabase = getSupabase();
    const { data, error } = await supabase.from('quotes').insert({ ...quoteData, created_by: userId, status: 'active' }).select().single();
    if (error) throw new AppError(500, 'Failed to create quote');
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateQuote = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const supabase = getSupabase();
    const { error } = await supabase.from('quotes').update(updates).eq('id', id);
    if (error) throw new AppError(500, 'Failed to update quote');
    res.json({ success: true, message: 'Quote updated' });
  } catch (error) {
    next(error);
  }
};

export const deleteQuote = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const { id } = req.params;
    const supabase = getSupabase();
    const { error } = await supabase.from('quotes').update({ status: 'deleted' }).eq('id', id);
    if (error) throw new AppError(500, 'Failed to delete quote');
    res.json({ success: true, message: 'Quote deleted' });
  } catch (error) {
    next(error);
  }
};
