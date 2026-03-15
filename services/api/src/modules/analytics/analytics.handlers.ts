import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { ApiResponse } from '@mindfuel/types';
import { getSupabase } from '../../lib/supabase';

export const getDashboardStats = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const supabase = getSupabase();
    const { data } = await supabase.rpc('get_dashboard_stats');
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getUserActivity = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const supabase = getSupabase();
    const { data } = await supabase.rpc('get_user_activity', { days: 30 });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getRevenueAnalytics = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const supabase = getSupabase();
    const { data } = await supabase.rpc('get_revenue_analytics', { days: 30 });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getWorkbookAnalytics = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const supabase = getSupabase();
    const { data } = await supabase.from('workbooks').select(`
      id,
      title,
      user_workbooks (
        user_id,
        progress_percentage,
        is_completed,
        total_reading_time_minutes
      )
    `);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
