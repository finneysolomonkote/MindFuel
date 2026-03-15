import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getProductCategories,
  getAllProducts,
  getProductById,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
} from '../modules/shop/shop.handlers';

const router = Router();

router.get('/categories', authenticate, getProductCategories);
router.get('/products', authenticate, getAllProducts);
router.get('/products/:id', authenticate, getProductById);

router.get('/cart', authenticate, getCart);
router.post('/cart', authenticate, addToCart);
router.put('/cart/:itemId', authenticate, updateCartItem);
router.delete('/cart/:itemId', authenticate, removeFromCart);
router.delete('/cart', authenticate, clearCart);

router.post('/cart/coupon', authenticate, applyCoupon);
router.delete('/cart/coupon', authenticate, removeCoupon);

export default router;
