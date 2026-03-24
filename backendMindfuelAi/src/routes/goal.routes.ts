import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createGoalSchema, updateGoalSchema, createGoalProgressSchema } from '../validation';
import {
  listGoals,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal,
  addProgress,
} from '../modules/goals/goal.handlers';

const router = Router();

router.use(authenticate);

router.get('/', listGoals);
router.get('/:id', getGoal);
router.post('/', validate(createGoalSchema), createGoal);
router.patch('/:id', validate(updateGoalSchema), updateGoal);
router.delete('/:id', deleteGoal);
router.post('/:id/progress', validate(createGoalProgressSchema), addProgress);

export default router;
