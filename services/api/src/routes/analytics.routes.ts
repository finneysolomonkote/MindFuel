import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@mindfuel/types';
import {
  getDashboardStats,
  getUserActivity,
  getRevenueAnalytics,
  getWorkbookAnalytics,
} from '../modules/analytics/analytics.handlers';

const router = Router();

router.use(authenticate, authorize(UserRole.ADMIN));

router.get('/dashboard', getDashboardStats);
router.get('/user-activity', getUserActivity);
router.get('/revenue', getRevenueAnalytics);
router.get('/workbooks', getWorkbookAnalytics);

export default router;
