import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getUserLibrary,
  addToLibrary,
  removeFromLibrary,
  getReadingProgress,
  updateReadingProgress,
  getBookmarks,
  createBookmark,
  deleteBookmark,
  getHighlights,
  createHighlight,
  deleteHighlight,
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} from '../modules/library/library.handlers';

const router = Router();

router.get('/', authenticate, getUserLibrary);
router.post('/add', authenticate, addToLibrary);
router.delete('/:bookId', authenticate, removeFromLibrary);

router.get('/progress/:bookId', authenticate, getReadingProgress);
router.post('/progress', authenticate, updateReadingProgress);

router.get('/bookmarks/:bookId', authenticate, getBookmarks);
router.post('/bookmarks', authenticate, createBookmark);
router.delete('/bookmarks/:id', authenticate, deleteBookmark);

router.get('/highlights/:bookId', authenticate, getHighlights);
router.post('/highlights', authenticate, createHighlight);
router.delete('/highlights/:id', authenticate, deleteHighlight);

router.get('/notes/:bookId', authenticate, getNotes);
router.post('/notes', authenticate, createNote);
router.put('/notes/:id', authenticate, updateNote);
router.delete('/notes/:id', authenticate, deleteNote);

export default router;
