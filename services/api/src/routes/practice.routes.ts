import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getAllPractices,
  getPracticeById,
  startPracticeSession,
  completePracticeSession,
  savePracticeAnswer,
  getUserPracticeSessions,
  createPractice,
  updatePractice,
  deletePractice,
} from '../modules/practices/practice.handlers';

const router = Router();

router.get('/', authenticate, getAllPractices);
router.get('/:id', authenticate, getPracticeById);
router.get('/sessions/me', authenticate, getUserPracticeSessions);
router.post('/sessions/start', authenticate, startPracticeSession);
router.post('/sessions/:sessionId/complete', authenticate, completePracticeSession);
router.post('/answers', authenticate, savePracticeAnswer);

router.post('/', authenticate, authorize('admin', 'super_admin'), createPractice);
router.put('/:id', authenticate, authorize('admin', 'super_admin'), updatePractice);
router.delete('/:id', authenticate, authorize('admin', 'super_admin'), deletePractice);

export default router;
