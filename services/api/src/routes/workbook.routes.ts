import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { UserRole } from '@mindfuel/types';
import {
  createWorkbookSchema,
  updateWorkbookSchema,
  createChapterSchema,
  createSectionSchema,
} from '@mindfuel/validation';
import {
  listWorkbooks,
  getWorkbook,
  createWorkbook,
  updateWorkbook,
  deleteWorkbook,
  getChapters,
  createChapter,
  getSections,
  createSection,
} from '../modules/workbooks/workbook.handlers';

const router = Router();

router.get('/', authenticate, listWorkbooks);
router.get('/:id', authenticate, getWorkbook);
router.post('/', authenticate, authorize(UserRole.ADMIN), validate(createWorkbookSchema), createWorkbook);
router.patch('/:id', authenticate, authorize(UserRole.ADMIN), validate(updateWorkbookSchema), updateWorkbook);
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), deleteWorkbook);

router.get('/:id/chapters', authenticate, getChapters);
router.post('/:id/chapters', authenticate, authorize(UserRole.ADMIN), validate(createChapterSchema), createChapter);

router.get('/chapters/:chapterId/sections', authenticate, getSections);
router.post('/chapters/:chapterId/sections', authenticate, authorize(UserRole.ADMIN), validate(createSectionSchema), createSection);

export default router;
