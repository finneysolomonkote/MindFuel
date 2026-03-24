import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { ApiResponse } from '../../types';
import { getSupabase } from '../../lib/supabase';
import { AppError } from '../../middleware/error-handler';

export const listProducts = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const supabase = getSupabase();
    const { data } = await supabase.from('products').select('*').eq('status', 'active');
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const { id } = req.params;
    const supabase = getSupabase();
    const { data } = await supabase.from('products').select('*').eq('id', id).single();
    if (!data) throw new AppError(404, 'Product not found');
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const productData = req.body;
    const supabase = getSupabase();
    const { data, error } = await supabase.from('products').insert({ ...productData, status: 'active' }).select().single();
    if (error) throw new AppError(500, 'Failed to create product');
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const supabase = getSupabase();
    const { error } = await supabase.from('products').update(updates).eq('id', id);
    if (error) throw new AppError(500, 'Failed to update product');
    res.json({ success: true, message: 'Product updated' });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const { id } = req.params;
    const supabase = getSupabase();
    const { error } = await supabase.from('products').update({ status: 'deleted' }).eq('id', id);
    if (error) throw new AppError(500, 'Failed to delete product');
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};
