import { Router } from 'express';
import { UserRole } from '@mindfuel/types';
import { authenticate, authorize } from '../middleware/auth';
import {
  getDashboard,
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getAllCoupons,
  manageNotificationCampaign,
  getAuditLogs,
} from '../modules/admin/admin.handlers';
import {
  ingestBook,
  reindexBookContent,
  deleteBookIndex,
  getIngestionStatus,
} from '../modules/admin/ingestion.handlers';

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN));

router.get('/dashboard', getDashboard);

router.get('/users', getAllUsers);
router.put('/users/:userId/status', updateUserStatus);
router.put('/users/:userId/role', updateUserRole);

router.get('/coupons', getAllCoupons);
router.post('/coupons', createCoupon);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

router.post('/notifications/campaign', manageNotificationCampaign);

router.get('/audit-logs', getAuditLogs);

router.get('/ingestion/status', getIngestionStatus);
router.post('/ingestion/books/:bookId', ingestBook);
router.post('/ingestion/books/:bookId/reindex', reindexBookContent);
router.delete('/ingestion/books/:bookId', deleteBookIndex);

export default router;
