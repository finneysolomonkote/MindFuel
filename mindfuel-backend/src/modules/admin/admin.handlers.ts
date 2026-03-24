import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { ApiResponse } from '../../types';
import { getSupabase } from '../../lib/supabase';
import { AppError } from '../../middleware/error-handler';

export const getDashboard = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const supabase = getSupabase();

    const [
      { count: totalUsers },
      { count: totalBooks },
      { count: totalOrders },
      { data: recentOrders },
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('books').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase
        .from('orders')
        .select('*, users(email, full_name)')
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

    const { data: revenue } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('payment_status', 'paid');

    const totalRevenue = revenue?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalBooks,
        totalOrders,
        totalRevenue,
        recentOrders,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const { status, role, search } = req.query;
    const supabase = getSupabase();

    let query = supabase
      .from('users')
      .select('id, email, full_name, phone_number, role, status, created_at, last_login_at');

    if (status) {
      query = query.eq('status', status);
    }

    if (role) {
      query = query.eq('role', role);
    }

    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw new AppError(500, 'Failed to fetch users');

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('users')
      .update({ status })
      .eq('id', userId)
      .select('id, email, full_name, status')
      .single();

    if (error) throw new AppError(500, 'Failed to update user status');

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId)
      .select('id, email, full_name, role')
      .single();

    if (error) throw new AppError(500, 'Failed to update user role');

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createCoupon = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const couponData = req.body;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('coupons')
      .insert(couponData)
      .select()
      .single();

    if (error) throw new AppError(500, 'Failed to create coupon');

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateCoupon = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const couponData = req.body;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('coupons')
      .update(couponData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError(500, 'Failed to update coupon');

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const supabase = getSupabase();

    const { error } = await supabase
      .from('coupons')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw new AppError(500, 'Failed to delete coupon');

    res.json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
};

export const getAllCoupons = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new AppError(500, 'Failed to fetch coupons');

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const manageNotificationCampaign = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const { title, body, target_users, schedule_at } = req.body;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('notification_campaigns')
      .insert({
        title,
        body,
        target_users,
        schedule_at,
        status: schedule_at ? 'scheduled' : 'pending',
      })
      .select()
      .single();

    if (error) throw new AppError(500, 'Failed to create notification campaign');

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const { action, user_id, start_date, end_date } = req.query;
    const supabase = getSupabase();

    let query = supabase
      .from('audit_logs')
      .select('*, users(email, full_name)')
      .order('created_at', { ascending: false });

    if (action) {
      query = query.eq('action', action);
    }

    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    if (start_date) {
      query = query.gte('created_at', start_date);
    }

    if (end_date) {
      query = query.lte('created_at', end_date);
    }

    const { data, error } = await query.limit(100);

    if (error) throw new AppError(500, 'Failed to fetch audit logs');

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
