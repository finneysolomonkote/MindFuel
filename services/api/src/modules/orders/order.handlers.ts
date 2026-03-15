import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { ApiResponse } from '@mindfuel/types';
import { getSupabase } from '../../lib/supabase';
import { createOrder as createRazorpayOrder, verifyPaymentSignature } from '../../lib/razorpay';
import { AppError } from '../../middleware/error-handler';

export const listOrders = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const supabase = getSupabase();

    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*)), payments(*)')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw new AppError(404, 'Order not found');

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { shipping_address, billing_address } = req.body;
    const supabase = getSupabase();

    const { data: cart } = await supabase
      .from('carts')
      .select('*, cart_items(*, products(*))')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (!cart || !cart.cart_items || cart.cart_items.length === 0) {
      throw new AppError(400, 'Cart is empty');
    }

    const subtotal = cart.cart_items.reduce((sum: number, item: any) => sum + item.subtotal, 0);
    const taxAmount = subtotal * 0.18;
    const discountAmount = cart.discount_amount || 0;
    const totalAmount = subtotal + taxAmount - discountAmount;

    const receipt = `order_${Date.now()}`;
    const razorpayOrder = await createRazorpayOrder(
      Math.round(totalAmount * 100),
      'INR',
      receipt
    );

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        order_number: receipt,
        subtotal_amount: subtotal,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        currency: 'INR',
        status: 'pending',
        payment_status: 'pending',
        shipping_address,
        billing_address,
      })
      .select()
      .single();

    if (orderError) throw new AppError(500, 'Failed to create order');

    const orderItems = cart.cart_items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.subtotal,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw new AppError(500, 'Failed to create order items');

    await supabase
      .from('carts')
      .update({ status: 'converted' })
      .eq('id', cart.id);

    res.status(201).json({
      success: true,
      data: {
        order,
        razorpay_order_id: razorpayOrder.id,
        razorpay_key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user!.id;
    const supabase = getSupabase();

    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      throw new AppError(400, 'Invalid payment signature');
    }

    const { data: order } = await supabase
      .from('orders')
      .select('*, order_items(*, products(book_id))')
      .eq('id', order_id)
      .eq('user_id', userId)
      .single();

    if (!order) {
      throw new AppError(404, 'Order not found');
    }

    await supabase
      .from('orders')
      .update({
        status: 'confirmed',
        payment_status: 'paid',
      })
      .eq('id', order_id);

    await supabase.from('payments').insert({
      order_id,
      user_id: userId,
      amount: order.total_amount,
      currency: order.currency,
      payment_method: 'razorpay',
      payment_gateway: 'razorpay',
      transaction_id: razorpay_payment_id,
      gateway_order_id: razorpay_order_id,
      gateway_signature: razorpay_signature,
      status: 'completed',
    });

    for (const item of order.order_items) {
      if (item.products.book_id) {
        await supabase
          .from('entitlements')
          .insert({
            user_id: userId,
            book_id: item.products.book_id,
            order_id,
            granted_via: 'purchase',
          })
          .onConflict('user_id,book_id')
          .merge();

        await supabase
          .from('user_library')
          .insert({
            user_id: userId,
            book_id: item.products.book_id,
          })
          .onConflict('user_id,book_id')
          .merge();
      }
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const handleWebhook = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const { event, payload } = req.body;
    const supabase = getSupabase();

    if (event === 'payment.captured') {
      const { data: payment } = await supabase
        .from('payments')
        .select('*, orders(user_id)')
        .eq('transaction_id', payload.payment.entity.id)
        .single();

      if (payment) {
        await supabase
          .from('payments')
          .update({ status: 'completed' })
          .eq('id', payment.id);
      }
    } else if (event === 'payment.failed') {
      const { data: payment } = await supabase
        .from('payments')
        .select('order_id')
        .eq('transaction_id', payload.payment.entity.id)
        .single();

      if (payment) {
        await supabase
          .from('orders')
          .update({ payment_status: 'failed' })
          .eq('id', payment.order_id);

        await supabase
          .from('payments')
          .update({ status: 'failed' })
          .eq('id', payment.id);
      }
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const listAllOrders = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const supabase = getSupabase();

    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*)), users(email, full_name)')
      .order('created_at', { ascending: false });

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
