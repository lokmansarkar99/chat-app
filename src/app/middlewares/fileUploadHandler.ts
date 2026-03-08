import { Request } from 'express';
import fs from 'fs';
import { StatusCodes } from 'http-status-codes';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import ApiError from '../../errors/ApiErrors';

const fileUploadHandler = () => {
  const baseUploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(baseUploadDir)) fs.mkdirSync(baseUploadDir);

  const createDir = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
  };

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let uploadDir: string;

      switch (file.fieldname) {
        // ✅ প্রতিটা field নিজের folder-এ যাবে
        case 'profileImage':
          uploadDir = path.join(baseUploadDir, 'user');      // /uploads/user/
          break;
        case 'productImage':
          uploadDir = path.join(baseUploadDir, 'product');   // /uploads/product/
          break;
        case 'image':
          uploadDir = path.join(baseUploadDir, 'image');     // /uploads/image/
          break;
        case 'media':
          uploadDir = path.join(baseUploadDir, 'media');     // /uploads/media/
          break;
        case 'doc':
          uploadDir = path.join(baseUploadDir, 'doc');       // /uploads/doc/
          break;
        default:
          return cb(
            new ApiError(StatusCodes.BAD_REQUEST, `File field "${file.fieldname}" is not supported`),
            ''
          );
      }

      createDir(uploadDir);
      cb(null, uploadDir);
    },

    filename: (_req, file, cb) => {
      const fileExt  = path.extname(file.originalname);
      const baseName = file.originalname
        .replace(fileExt, '')
        .toLowerCase()
        .split(' ')
        .join('-');
      cb(null, `${baseName}-${Date.now()}${fileExt}`);
    },
  });

  const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const mime = file.mimetype;

    if (['profileImage', 'productImage', 'image'].includes(file.fieldname)) {
      if (['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(mime)) {
        return cb(null, true);
      }
      return cb(new ApiError(StatusCodes.BAD_REQUEST, 'Only .jpeg, .jpg, .png, .webp allowed'));
    }

    if (file.fieldname === 'media') {
      if (mime === 'video/mp4' || mime === 'audio/mpeg') {
        return cb(null, true);
      }
      return cb(new ApiError(StatusCodes.BAD_REQUEST, 'Only .mp4, .mp3 allowed'));
    }

    if (file.fieldname === 'doc') {
      if (mime === 'application/pdf') return cb(null, true);
      return cb(new ApiError(StatusCodes.BAD_REQUEST, 'Only PDF allowed'));
    }

    return cb(new ApiError(StatusCodes.BAD_REQUEST, 'File type not supported'));
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  }).fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'productImage', maxCount: 5 },
    { name: 'image',        maxCount: 3 },
    { name: 'media',        maxCount: 3 },
    { name: 'doc',          maxCount: 3 },
  ]);
};

export default fileUploadHandler;
