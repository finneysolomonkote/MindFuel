import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@mindfuel/types';
import {
  listOrders,
  getOrderById,
  createOrder,
  verifyPayment,
  handleWebhook,
  listAllOrders,
} from '../modules/orders/order.handlers';

const router = Router();

router.post('/webhook', handleWebhook);

router.use(authenticate);

router.get('/', listOrders);
router.get('/:id', getOrderById);
router.post('/', createOrder);
router.post('/verify', verifyPayment);

router.get('/admin/all', authorize(UserRole.ADMIN), listAllOrders);

export default router;
