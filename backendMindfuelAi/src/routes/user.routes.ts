import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateUserSchema } from '../validation';
import { getProfile, updateProfile, getUserWorkbooks } from '../modules/users/user.handlers';

const router = Router();

router.use(authenticate);

router.get('/profile', getProfile);
router.patch('/profile', validate(updateUserSchema), updateProfile);
router.get('/workbooks', getUserWorkbooks);

export default router;
