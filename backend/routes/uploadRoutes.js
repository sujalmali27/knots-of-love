import path from 'path';
import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const router = express.Router();

// 1. Configure Cloudinary with the keys you added to Render
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Configure Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'knots-of-love', // Images will be organized in this folder
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }], // Optional: resizes for better performance
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images only!'));
  }
}

const upload = multer({ 
  storage, 
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

router.post('/', (req, res) => {
  upload.single('image')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Image too large! Max limit is 5MB' });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "Please upload an image" 
      });
    }

    // req.file.path is now a permanent URL (https://res.cloudinary.com/...)
    res.status(200).send({
      message: 'Image uploaded successfully',
      image: req.file.path, 
    });
  });
});

export default router;