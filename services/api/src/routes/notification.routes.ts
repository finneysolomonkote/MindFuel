import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { registerDeviceSchema } from '@mindfuel/validation';
import {
  listNotifications,
  markAsRead,
  registerDevice,
} from '../modules/notifications/notification.handlers';

const router = Router();

router.use(authenticate);

router.get('/', listNotifications);
router.patch('/:id/read', markAsRead);
router.post('/devices', validate(registerDeviceSchema), registerDevice);

export default router;
