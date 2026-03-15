import Razorpay from 'razorpay';
import crypto from 'crypto';
import { config } from '@mindfuel/config';

const razorpay = new Razorpay({
  key_id: config.razorpay.keyId,
  key_secret: config.razorpay.keySecret,
});

export const createOrder = async (
  amount: number,
  currency: string = 'INR',
  receipt: string
): Promise<any> => {
  return razorpay.orders.create({
    amount: amount * 100,
    currency,
    receipt,
  });
};

export const verifyPaymentSignature = (
  orderId: string,
  paymentId: string,
  signature: string
): boolean => {
  const text = `${orderId}|${paymentId}`;
  const generated_signature = crypto
    .createHmac('sha256', config.razorpay.keySecret)
    .update(text)
    .digest('hex');

  return generated_signature === signature;
};

export const capturePayment = async (
  paymentId: string,
  amount: number,
  currency: string = 'INR'
): Promise<any> => {
  return razorpay.payments.capture(paymentId, amount * 100, currency);
};
