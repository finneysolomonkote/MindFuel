import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { ApiResponse } from '@mindfuel/types';
import { getSupabase } from '../../lib/supabase';
import { AppError } from '../../middleware/error-handler';

export const listNotifications = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const supabase = getSupabase();
    const { data } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const supabase = getSupabase();
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id).eq('user_id', userId);
    if (error) throw new AppError(500, 'Failed to mark as read');
    res.json({ success: true, message: 'Marked as read' });
  } catch (error) {
    next(error);
  }
};

export const registerDevice = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const { device_token, device_type } = req.body;
    const userId = req.user!.id;
    const supabase = getSupabase();

    await supabase.from('user_devices').update({ is_active: false }).eq('user_id', userId).eq('device_token', device_token);

    const { data, error } = await supabase.from('user_devices').insert({
      user_id: userId,
      device_token,
      device_type,
      is_active: true,
    }).select().single();

    if (error) throw new AppError(500, 'Failed to register device');
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
