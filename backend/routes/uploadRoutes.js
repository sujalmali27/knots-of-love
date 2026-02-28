import path from 'path';
import express from 'express';
import multer from 'multer';

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    // Points to the 'uploads/' folder in your root directory
    cb(null, 'uploads/'); 
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
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

// ✅ Configured with 5MB limit and proper file filtering
const upload = multer({ 
  storage, 
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

router.post('/', (req, res) => {
  // We wrap the upload in a function to catch Multer errors specifically
  upload.single('image')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Image too large! Max limit is 5MB' });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      // Catches the "Images only!" error from checkFileType
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "Please upload an image" 
      });
    }

    // Convert Windows backslashes to forward slashes for the database
    const rawPath = req.file.path.replace(/\\/g, "/"); 
    
    const cleanPath = rawPath.startsWith('backend/') 
      ? rawPath.replace('backend/', '') 
      : rawPath;

    res.status(200).send({
      message: 'Image uploaded successfully',
      image: `/${cleanPath}`, 
    });
  });
});

export default router;