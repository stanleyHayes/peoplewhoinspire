import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import multer from 'multer';
import auth from '../middleware/auth';
import upload from '../middleware/upload';

const router = Router();

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const AVATAR_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  error?: {
    message?: string;
  };
}

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
      return;
    }

    cb(new Error('Only image files are allowed'));
  },
});

const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (AVATAR_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
      return;
    }

    cb(new Error('Only JPG, PNG, WebP, or GIF images are allowed for profile photos'));
  },
});

const getCloudinaryConfig = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary is not configured');
  }

  return { cloudName, apiKey, apiSecret };
};

const signCloudinaryParams = (params: Record<string, string>, apiSecret: string) => {
  const signatureBase = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return crypto
    .createHash('sha1')
    .update(`${signatureBase}${apiSecret}`)
    .digest('hex');
};

const uploadImageToCloudinary = async (
  file: Express.Multer.File,
  folder = process.env.CLOUDINARY_IMAGE_FOLDER || 'people-who-inspire/images'
) => {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const timestamp = Math.round(Date.now() / 1000).toString();
  const signedParams = { folder, timestamp };
  const signature = signCloudinaryParams(signedParams, apiSecret);

  const formData = new FormData();
  formData.append('file', new Blob([new Uint8Array(file.buffer)], { type: file.mimetype }), file.originalname);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);
  formData.append('folder', folder);
  formData.append('signature', signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });
  const data = (await response.json()) as CloudinaryUploadResponse;

  if (!response.ok || !data.secure_url) {
    throw new Error(data.error?.message || 'Cloudinary upload failed');
  }

  return data;
};

const handleAvatarUpload = avatarUpload.single('file');
const handleImageUpload = imageUpload.single('file');

type UploadMiddlewareHandler = (
  req: Request,
  res: Response,
  callback: (error?: unknown) => void
) => void;

const createUploadMiddleware =
  (handler: UploadMiddlewareHandler, label: string) =>
  (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, (error: unknown) => {
      if (!error) {
        next();
        return;
      }

      if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({ message: `${label} must be 5MB or smaller` });
        return;
      }

      const message = error instanceof Error ? error.message : `Unable to upload ${label.toLowerCase()}`;
      res.status(400).json({ message });
    });
  };

const avatarUploadMiddleware = createUploadMiddleware(handleAvatarUpload, 'Profile photo');
const imageUploadMiddleware = createUploadMiddleware(handleImageUpload, 'Image');

const sendCloudinaryUpload = async (
  req: Request,
  res: Response,
  label: 'Image' | 'Profile photo',
  folder?: string
) => {
  if (!req.file) {
    res.status(400).json({ message: `No ${label.toLowerCase()} uploaded` });
    return;
  }

  try {
    const uploaded = await uploadImageToCloudinary(req.file, folder);

    res.json({
      message: `${label} uploaded successfully`,
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
      width: uploaded.width,
      height: uploaded.height,
      format: uploaded.format,
      size: uploaded.bytes,
      originalname: req.file.originalname,
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message === 'Cloudinary is not configured'
        ? 'Cloudinary is not configured on the server'
        : `Failed to upload ${label.toLowerCase()} to Cloudinary`;

    console.error(`Cloudinary ${label.toLowerCase()} upload error:`, error);
    res.status(500).json({ message });
  }
};

// POST /api/upload/image - Protected (Cloudinary image upload)
router.post('/image', auth, imageUploadMiddleware, async (req: Request, res: Response): Promise<void> => {
  await sendCloudinaryUpload(req, res, 'Image');
});

// POST /api/upload/avatar - Protected (Cloudinary avatar upload)
router.post('/avatar', auth, avatarUploadMiddleware, async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ message: 'No profile photo uploaded' });
    return;
  }

  if (!AVATAR_MIME_TYPES.has(req.file.mimetype)) {
    res.status(400).json({ message: 'Only JPG, PNG, WebP, or GIF images are allowed for profile photos' });
    return;
  }

  await sendCloudinaryUpload(
    req,
    res,
    'Profile photo',
    process.env.CLOUDINARY_AVATAR_FOLDER || 'people-who-inspire/avatars'
  );
});

// POST /api/upload - Protected (single file upload)
router.post('/', auth, upload.single('file'), (req: Request, res: Response): void => {
  if (!req.file) {
    res.status(400).json({ message: 'No file uploaded' });
    return;
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    message: 'File uploaded successfully',
    url: fileUrl,
    filename: req.file.filename,
    originalname: req.file.originalname,
    size: req.file.size,
  });
});

// POST /api/upload/multiple - Protected (multiple file upload)
router.post('/multiple', auth, upload.array('files', 10), (req: Request, res: Response): void => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    res.status(400).json({ message: 'No files uploaded' });
    return;
  }

  const uploadedFiles = files.map((file) => ({
    url: `/uploads/${file.filename}`,
    filename: file.filename,
    originalname: file.originalname,
    size: file.size,
  }));

  res.json({
    message: 'Files uploaded successfully',
    files: uploadedFiles,
  });
});

export default router;
