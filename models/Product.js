const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: String,
  price: Number,
  gender: String, // men / women
  movement: String, // quartz / automatic
  style: String, // casual / formal / sports

  images: [String], // S3 URLs later
  video: String,

  description: String,

  specs: {
    dialColor: String,
    strapMaterial: String,
    waterResistance: String,
    caseSize: String
  }

}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);