import { Router } from 'express';
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

router.post('/', authenticate, authorize('admin', 'super_admin'), createBook);
router.put('/:id', authenticate, authorize('admin', 'super_admin'), updateBook);
router.delete('/:id', authenticate, authorize('admin', 'super_admin'), deleteBook);

export default router;
