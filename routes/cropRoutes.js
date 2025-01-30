const express = require('express');
const router = express.Router();
const cropController = require('../controllers/cropController'); // Correct import path
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploadZ/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Create a new crop (Authorized only)
router.post('/crops', authMiddleware.authenticate, upload.single('crop_image'), cropController.createCrop);

// List all crops (Authorized only)
router.get('/crops', authMiddleware.authenticate, cropController.listCrops);

// Delete a crop by ID (Authorized only)
router.delete('/crops/:id', authMiddleware.authenticate, cropController.deleteCrop);

module.exports = router;