import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { ApiResponse, UserProfile, UpdateUserDto } from '@mindfuel/types';
import { getSupabase } from '../../lib/supabase';
import { AppError } from '../../middleware/error-handler';

export const getProfile = async (
  req: AuthRequest,
  res: Response<ApiResponse<UserProfile>>,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const supabase = getSupabase();

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!user) throw new AppError(404, 'User not found');

    const { data: stats } = await supabase.rpc('get_user_stats', { user_id: userId });

    res.json({
      success: true,
      data: {
        ...user,
        ...stats,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const updates = req.body;
    const supabase = getSupabase();

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);

    if (error) throw new AppError(500, 'Failed to update profile');

    res.json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getUserWorkbooks = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const supabase = getSupabase();

    const { data } = await supabase
      .from('user_workbooks')
      .select(`
        *,
        workbooks:workbook_id (*)
      `)
      .eq('user_id', userId);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
