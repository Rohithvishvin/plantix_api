const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  crop_name: { type: String, required: true },
  crop_description: { type: String, required: true },
  crop_image: { type: String, required: true },
});

const Crop = mongoose.model('Crop', cropSchema);

module.exports = Crop;
