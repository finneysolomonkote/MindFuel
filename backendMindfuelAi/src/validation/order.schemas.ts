import { z } from 'zod';

export const createOrderSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
});

export const verifyPaymentSchema = z.object({
  order_id: z.string().uuid('Invalid order ID'),
  razorpay_order_id: z.string().min(1, 'Razorpay order ID is required'),
  razorpay_payment_id: z.string().min(1, 'Razorpay payment ID is required'),
  razorpay_signature: z.string().min(1, 'Razorpay signature is required'),
});
