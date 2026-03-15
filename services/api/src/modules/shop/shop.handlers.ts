import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { ApiResponse } from '@mindfuel/types';
import { getSupabase } from '../../lib/supabase';
import { AppError } from '../../middleware/error-handler';

export const getProductCategories = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw new AppError(500, 'Failed to fetch categories');

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getAllProducts = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const { category, search } = req.query;
    const supabase = getSupabase();

    let query = supabase
      .from('products')
      .select('*, product_categories(name), books(title, author, cover_image_url)')
      .eq('status', 'active');

    if (category) {
      query = query.eq('category_id', category);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw new AppError(500, 'Failed to fetch products');

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const supabase = getSupabase();

    const { data: product, error } = await supabase
      .from('products')
      .select('*, product_categories(name), books(*)')
      .eq('id', id)
      .single();

    if (error) throw new AppError(404, 'Product not found');

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const getCart = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const supabase = getSupabase();

    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (!cart) {
      const { data: newCart, error: createError } = await supabase
        .from('carts')
        .insert({ user_id: userId })
        .select()
        .single();

      if (createError) throw new AppError(500, 'Failed to create cart');

      return res.json({ success: true, data: { ...newCart, cart_items: [] } });
    }

    const { data: cartWithItems, error } = await supabase
      .from('carts')
      .select('*, cart_items(*, products(*, books(*)))')
      .eq('id', cart.id)
      .single();

    if (error) throw new AppError(500, 'Failed to fetch cart');

    res.json({ success: true, data: cartWithItems });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { product_id, quantity = 1 } = req.body;
    const supabase = getSupabase();

    const { data: product } = await supabase
      .from('products')
      .select('id, price, discount_price')
      .eq('id', product_id)
      .single();

    if (!product) {
      throw new AppError(404, 'Product not found');
    }

    let { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (!cart) {
      const { data: newCart, error: createError } = await supabase
        .from('carts')
        .insert({ user_id: userId })
        .select()
        .single();

      if (createError) throw new AppError(500, 'Failed to create cart');
      cart = newCart;
    }

    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cart.id)
      .eq('product_id', product_id)
      .maybeSingle();

    const price = product.discount_price || product.price;

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      const { data, error } = await supabase
        .from('cart_items')
        .update({
          quantity: newQuantity,
          subtotal: price * newQuantity,
        })
        .eq('id', existingItem.id)
        .select()
        .single();

      if (error) throw new AppError(500, 'Failed to update cart item');

      return res.json({ success: true, data });
    }

    const { data, error } = await supabase
      .from('cart_items')
      .insert({
        cart_id: cart.id,
        product_id,
        quantity,
        price,
        subtotal: price * quantity,
      })
      .select()
      .single();

    if (error) throw new AppError(500, 'Failed to add to cart');

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { itemId } = req.params;
    const { quantity } = req.body;
    const supabase = getSupabase();

    const { data: cartItem } = await supabase
      .from('cart_items')
      .select('*, carts(user_id), products(price, discount_price)')
      .eq('id', itemId)
      .single();

    if (!cartItem || cartItem.carts.user_id !== userId) {
      throw new AppError(404, 'Cart item not found');
    }

    const price = cartItem.products.discount_price || cartItem.products.price;

    const { data, error } = await supabase
      .from('cart_items')
      .update({
        quantity,
        subtotal: price * quantity,
      })
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw new AppError(500, 'Failed to update cart item');

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { itemId } = req.params;
    const supabase = getSupabase();

    const { data: cartItem } = await supabase
      .from('cart_items')
      .select('*, carts(user_id)')
      .eq('id', itemId)
      .single();

    if (!cartItem || cartItem.carts.user_id !== userId) {
      throw new AppError(404, 'Cart item not found');
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) throw new AppError(500, 'Failed to remove from cart');

    res.json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const supabase = getSupabase();

    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (cart) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cart.id);
    }

    res.json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
};

export const applyCoupon = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { coupon_code } = req.body;
    const supabase = getSupabase();

    const { data: coupon } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', coupon_code)
      .eq('is_active', true)
      .gte('valid_until', new Date().toISOString())
      .maybeSingle();

    if (!coupon) {
      throw new AppError(400, 'Invalid or expired coupon');
    }

    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
      throw new AppError(400, 'Coupon usage limit reached');
    }

    const { data: cart } = await supabase
      .from('carts')
      .select('id, total_amount')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (!cart) {
      throw new AppError(404, 'Cart not found');
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (cart.total_amount * coupon.discount_value) / 100;
      if (coupon.max_discount_amount) {
        discount = Math.min(discount, coupon.max_discount_amount);
      }
    } else {
      discount = coupon.discount_value;
    }

    if (coupon.min_order_amount && cart.total_amount < coupon.min_order_amount) {
      throw new AppError(400, `Minimum order amount is ${coupon.min_order_amount}`);
    }

    await supabase
      .from('carts')
      .update({
        coupon_id: coupon.id,
        discount_amount: discount,
      })
      .eq('id', cart.id);

    res.json({
      success: true,
      data: {
        coupon_code: coupon.code,
        discount_amount: discount,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const removeCoupon = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const supabase = getSupabase();

    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (cart) {
      await supabase
        .from('carts')
        .update({
          coupon_id: null,
          discount_amount: 0,
        })
        .eq('id', cart.id);
    }

    res.json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
};
