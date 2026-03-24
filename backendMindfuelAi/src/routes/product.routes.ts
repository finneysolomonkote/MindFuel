import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { UserRole } from '../types';
import { createProductSchema, updateProductSchema } from '../validation';
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../modules/products/product.handlers';

const router = Router();

router.get('/', authenticate, listProducts);
router.get('/:id', authenticate, getProduct);
router.post('/', authenticate, authorize(UserRole.ADMIN), validate(createProductSchema), createProduct);
router.patch('/:id', authenticate, authorize(UserRole.ADMIN), validate(updateProductSchema), updateProduct);
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), deleteProduct);

export default router;
