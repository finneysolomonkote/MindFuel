import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { UserRole } from '@mindfuel/types';
import { createQuoteSchema, updateQuoteSchema } from '@mindfuel/validation';
import {
  getDailyQuote,
  listQuotes,
  createQuote,
  updateQuote,
  deleteQuote,
} from '../modules/quotes/quote.handlers';

const router = Router();

router.get('/daily', authenticate, getDailyQuote);
router.get('/', authenticate, authorize(UserRole.ADMIN), listQuotes);
router.post('/', authenticate, authorize(UserRole.ADMIN), validate(createQuoteSchema), createQuote);
router.patch('/:id', authenticate, authorize(UserRole.ADMIN), validate(updateQuoteSchema), updateQuote);
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), deleteQuote);

export default router;
