import { Router } from 'express';
import multer from 'multer';
import { UserRole } from '@mindfuel/types';
import { authenticate, authorize } from '../middleware/auth';
import { uploadImage, uploadDocument, getFileUrl } from '../modules/uploads/upload.handlers';

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/image', authenticate, upload.single('file'), uploadImage);
router.post('/file', authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), upload.single('file'), uploadDocument);
router.get('/:key', authenticate, getFileUrl);

export default router;
