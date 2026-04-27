const Product = require('../models/Product');
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../utils/s3");
// GET all products
exports.getProducts = async (req, res) => {
  const products = await Product.find();
  res.json(products);
};

// POST product

exports.createProduct = async (req, res) => {
  try {
    // get uploaded image URLs
    const imageUrls = req.files ? req.files.map(file => file.location) : [];

    const product = new Product({
      name: req.body.name,
      brand: req.body.brand,
      price: req.body.price,
      gender: req.body.gender,
      movement: req.body.movement,
      style: req.body.style,
      description: req.body.description,

      images: imageUrls,

      specs: {
        dialColor: req.body.dialColor,
        strapMaterial: req.body.strapMaterial,
        waterResistance: req.body.waterResistance,
        caseSize: req.body.caseSize
      }
    });

    await product.save();

    res.json(product);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    // delete images from S3
    for (let url of product.images) {
      const key = url.split(".amazonaws.com/")[1];

      await s3.send(new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: key
      }));
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: "Product and images deleted ✅" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    // If new images uploaded → delete old ones
    if (req.files && req.files.length > 0) {

      for (let url of product.images) {
        const key = url.split(".amazonaws.com/")[1];

        await s3.send(new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET,
          Key: key
        }));
      }

      product.images = req.files.map(file => file.location);
    }

    // update fields
    product.name = req.body.name || product.name;
    product.brand = req.body.brand || product.brand;
    product.price = req.body.price || product.price;
    product.gender = req.body.gender || product.gender;

    await product.save();

    res.json(product);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
