const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const path = require('path');
const fs = require('fs');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const cropRoutes = require('./routes/cropRoutes');
// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    // Create the uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to filename
  },
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, JPG, and PNG files are allowed!'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize Google Cloud Vision client
const client = new ImageAnnotatorClient();

// API endpoint to upload and analyze image
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded or invalid file type' });
    }

    const imagePath = req.file.path;

    // Perform label detection using Google Cloud Vision API
    const [result] = await client.labelDetection(imagePath);
    const labels = result.labelAnnotations;

    // Filter labels related to crops
    const cropLabels = labels.filter((label) =>
      ['crop', 'plant', 'agriculture', 'farm', 'field'].some((keyword) =>
        label.description.toLowerCase().includes(keyword)
      )
    );

    if (cropLabels.length === 0) {
      return res.status(404).json({ message: 'No crop identified in the image' });
    }

    // Construct the image URL
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    // Respond with crop information and image URL
    res.json({
      message: 'Crop identified successfully',
      imageUrl: imageUrl,
      crops: cropLabels.map((label) => ({
        crop: label.description,
        confidence: label.score,
      })),
    });
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ error: 'Failed to analyze image', details: error.message });
  }
});

// Routes
app.use('/api', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/crop', cropRoutes);



// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});