import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createJournalSchema, updateJournalSchema } from '../validation';
import {
  listJournals,
  getJournal,
  createJournal,
  updateJournal,
  deleteJournal,
} from '../modules/journals/journal.handlers';

const router = Router();

router.use(authenticate);

router.get('/', listJournals);
router.get('/:id', getJournal);
router.post('/', validate(createJournalSchema), createJournal);
router.patch('/:id', validate(updateJournalSchema), updateJournal);
router.delete('/:id', deleteJournal);

export default router;
