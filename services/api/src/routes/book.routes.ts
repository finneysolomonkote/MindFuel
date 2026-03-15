import { Router } from 'express';
import { UserRole } from '@mindfuel/types';
import { authenticate, authorize } from '../middleware/auth';
import {
  getAllBooks,
  getBookById,
  getBookChapters,
  getChapterContent,
  createBook,
  updateBook,
  deleteBook,
} from '../modules/books/book.handlers';

const router = Router();

router.get('/', authenticate, getAllBooks);
router.get('/:id', authenticate, getBookById);
router.get('/:bookId/chapters', authenticate, getBookChapters);
router.get('/chapters/:chapterId/content', authenticate, getChapterContent);

router.post('/', authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), createBook);
router.put('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), updateBook);
router.delete('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), deleteBook);

export default router;
