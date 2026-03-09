// src/app/middlewares/fileUploadHandler.ts

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

  // ── Field → Folder mapping ─────────────────────────────────────
  const FIELD_FOLDER_MAP: Record<string, string> = {
    profileImage: 'user',
    productImage: 'product',
    image:        'image',
    media:        'media',
    doc:          'doc',
    attachment:   'attachments',   // ✅ chat attachments
  };

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const folder = FIELD_FOLDER_MAP[file.fieldname];

      if (!folder) {
        return cb(
          new ApiError(StatusCodes.BAD_REQUEST, `File field "${file.fieldname}" is not supported`),
          ''
        );
      }

      const uploadDir = path.join(baseUploadDir, folder);
      createDir(uploadDir);
      cb(null, uploadDir);
    },

    filename: (_req, file, cb) => {
      const fileExt  = path.extname(file.originalname);
      const baseName = file.originalname
        .replace(fileExt, '')
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9\-]/g, '');  // ✅ special chars remove
      cb(null, `${baseName}-${Date.now()}${fileExt}`);
    },
  });

  const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    const mime = file.mimetype;

    // ── Profile / Product / General image ─────────────────────
    if (['profileImage', 'productImage', 'image'].includes(file.fieldname)) {
      if (['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(mime)) {
        return cb(null, true);
      }
      return cb(new ApiError(StatusCodes.BAD_REQUEST, 'Only .jpeg, .jpg, .png, .webp allowed'));
    }

    // ── Video / Audio ──────────────────────────────────────────
    if (file.fieldname === 'media') {
      if (['video/mp4', 'audio/mpeg', 'audio/mp3'].includes(mime)) {
        return cb(null, true);
      }
      return cb(new ApiError(StatusCodes.BAD_REQUEST, 'Only .mp4, .mp3 allowed'));
    }

    // ── PDF Document ───────────────────────────────────────────
    if (file.fieldname === 'doc') {
      if (mime === 'application/pdf') return cb(null, true);
      return cb(new ApiError(StatusCodes.BAD_REQUEST, 'Only PDF allowed'));
    }

    // ── Chat Attachment: image + video + pdf ───────────────────
    // Chat-এ যেকোনো ধরনের file পাঠানো যাবে
    if (file.fieldname === 'attachment') {
      const allowed = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
        'video/mp4',
        'audio/mpeg', 'audio/mp3',
        'application/pdf',
      ];
      if (allowed.includes(mime)) return cb(null, true);
      return cb(
        new ApiError(
          StatusCodes.BAD_REQUEST,
          'Attachment: Only images, .mp4, .mp3, .pdf allowed'
        )
      );
    }

    return cb(new ApiError(StatusCodes.BAD_REQUEST, 'File type not supported'));
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, 
  }).fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'productImage', maxCount: 5 },
    { name: 'image',        maxCount: 3 },
    { name: 'media',        maxCount: 3 },
    { name: 'doc',          maxCount: 3 },
    { name: 'attachment',   maxCount: 5 },  
  ]);
};

export default fileUploadHandler;
