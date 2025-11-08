import multer from 'multer';
import path from 'path';
import { config } from '../config/index.js';
import fs from 'fs';

// Ensure upload directory exists
if (!fs.existsSync(config.upload.dir)) {
  fs.mkdirSync(config.upload.dir, { recursive: true });
}

/**
 * Sanitize filename to prevent path traversal and other security issues
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
function sanitizeFilename(filename) {
  // Remove any path separators and null bytes
  return filename.replace(/[/\\]/g, '').replace(/\0/g, '').replace(/\.\./g, '').trim();
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.upload.dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix =
      Date.now() + '-' + Math.round(Math.random() * config.upload.filenameSuffixRange);
    const sanitized = sanitizeFilename(file.originalname);
    const ext = path.extname(sanitized);
    cb(null, `image-${uniqueSuffix}${ext}`);
  },
});

// File filter to validate mime types
const fileFilter = (req, file, cb) => {
  if (config.upload.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'), false);
  }
};

// Create multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
  },
});
