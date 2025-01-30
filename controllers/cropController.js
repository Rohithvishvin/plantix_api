const Crop = require('../models/Crop');
const fs = require('fs');
const path = require('path');

// Create a new crop
const createCrop = async (req, res) => {
  try {
    const { crop_name, crop_description } = req.body;

    // Ensure that required fields and the file are provided
    if (!crop_name || !crop_description || !req.file) {
      return res.status(400).json({ error: 'Missing required fields or image' });
    }

    const crop_image = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    const newCrop = new Crop({
      crop_name,
      crop_description,
      crop_image,
    });

    // Save the new crop to the database
    await newCrop.save();

    res.status(201).json({
      message: 'Crop created successfully',
      crop: newCrop,
    });
  } catch (error) {
    console.error('Error creating crop:', error);
    res.status(500).json({ error: 'Failed to create crop', details: error.message });
  }
};

// List all crops
const listCrops = async (req, res) => {
  try {
    // Retrieve all crops from the database
    const crops = await Crop.find();
    res.status(200).json({ crops });
  } catch (error) {
    console.error('Error fetching crops:', error);
    res.status(500).json({ error: 'Failed to fetch crops', details: error.message });
  }
};

// Delete a crop by ID
const deleteCrop = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the crop by its ID
    const crop = await Crop.findByIdAndDelete(id);

    if (!crop) {
      return res.status(404).json({ error: 'Crop not found' });
    }

    // Delete the associated image file from the server
    const imagePath = path.join(__dirname, '../uploads', path.basename(crop.crop_image));
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    res.status(200).json({ message: 'Crop deleted successfully' });
  } catch (error) {
    console.error('Error deleting crop:', error);
    res.status(500).json({ error: 'Failed to delete crop', details: error.message });
  }
};

// Export the functions
module.exports = {
  createCrop,
  listCrops,
  deleteCrop,
};