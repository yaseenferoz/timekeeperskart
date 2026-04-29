const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: String,
  price: Number,
  gender: String,

  // 👇 keep these (used for watches)
  movement: String,
  style: String,

  images: [String],
  video: String,

  description: String,

  specs: {
    dialColor: String,
    strapMaterial: String,
    waterResistance: String,
    caseSize: String
  },

  // ✅ NEW (IMPORTANT)
  category: {
    type: String,
    required: true,
    enum: ["watch", "smartwatch", "sunglasses", "shoes"]
  },

  // ✅ FLEXIBLE FIELD (FOR FUTURE)
  attributes: {
    type: Object,
    default: {}
  }

}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);