import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { ApiResponse } from '@mindfuel/types';
import { uploadFile as uploadToS3, getSignedUrl } from '../../lib/s3';
import { AppError } from '../../middleware/error-handler';

export const uploadImage = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      throw new AppError(400, 'No file uploaded');
    }

    const userId = req.user!.id;
    const { folder = 'general' } = req.body;

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      throw new AppError(400, 'Invalid file type. Only JPEG, PNG, and WebP are allowed');
    }

    const maxSize = 5 * 1024 * 1024;
    if (req.file.size > maxSize) {
      throw new AppError(400, 'File size exceeds 5MB limit');
    }

    const timestamp = Date.now();
    const fileName = `${folder}/${userId}/${timestamp}-${req.file.originalname}`;

    const s3Url = await uploadToS3(req.file.buffer, fileName, req.file.mimetype);

    res.json({
      success: true,
      data: {
        url: s3Url,
        filename: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const uploadDocument = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      throw new AppError(400, 'No file uploaded');
    }

    const userId = req.user!.id;
    const { folder = 'documents' } = req.body;

    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      throw new AppError(400, 'Invalid file type');
    }

    const maxSize = 10 * 1024 * 1024;
    if (req.file.size > maxSize) {
      throw new AppError(400, 'File size exceeds 10MB limit');
    }

    const timestamp = Date.now();
    const fileName = `${folder}/${userId}/${timestamp}-${req.file.originalname}`;

    const s3Url = await uploadToS3(req.file.buffer, fileName, req.file.mimetype);

    res.json({
      success: true,
      data: {
        url: s3Url,
        filename: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getFileUrl = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const { key } = req.params;

    const signedUrl = await getSignedUrl(key);

    res.json({
      success: true,
      data: {
        url: signedUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};
