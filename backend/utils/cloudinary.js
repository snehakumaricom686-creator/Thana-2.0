import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import crypto from 'crypto';

// Warning: Usually done in server.js but kept modular.
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'thana_evidence_vault',
    resource_type: 'auto'
  },
});

export const upload = multer({ storage: storage });

export const generateHash = (fileBuffer) => {
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
};
