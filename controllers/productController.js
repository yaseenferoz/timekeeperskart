const Product = require('../models/Product');
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../utils/s3");


// ✅ GET all products (with filters + pagination)
exports.getProducts = async (req, res) => {
  try {
    const { brand, gender, minPrice, maxPrice, search, page = 1 } = req.query;

    let filter = {};

    if (brand) filter.brand = brand;
    if (gender) filter.gender = gender;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const limit = 10;
    const skip = (page - 1) * limit;

    const products = await Product.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json(products);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ CREATE product (with validation)
exports.createProduct = async (req, res) => {
  try {
    const { name, price } = req.body;

    // validation
    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    const imageUrls = req.files ? req.files.map(file => file.location) : [];

    const product = new Product({
      name,
      brand: req.body.brand,
      price: Number(price),
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

    res.status(201).json(product);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};


// ✅ DELETE product (with safe S3 cleanup)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // delete images from S3 safely
    for (let url of product.images) {
      if (url && url.includes(".amazonaws.com/")) {
        const key = url.split(".amazonaws.com/")[1];

        await s3.send(new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET,
          Key: key
        }));
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: "Product and images deleted ✅" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ UPDATE product (full update support)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // If new images uploaded → delete old ones
    if (req.files && req.files.length > 0) {
      for (let url of product.images) {
        if (url && url.includes(".amazonaws.com/")) {
          const key = url.split(".amazonaws.com/")[1];

          await s3.send(new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET,
            Key: key
          }));
        }
      }

      product.images = req.files.map(file => file.location);
    }

    // update fields
    product.name = req.body.name || product.name;
    product.brand = req.body.brand || product.brand;
    product.price = req.body.price ? Number(req.body.price) : product.price;
    product.gender = req.body.gender || product.gender;
    product.movement = req.body.movement || product.movement;
    product.style = req.body.style || product.style;
    product.description = req.body.description || product.description;

    product.specs = {
      dialColor: req.body.dialColor || product.specs?.dialColor,
      strapMaterial: req.body.strapMaterial || product.specs?.strapMaterial,
      waterResistance: req.body.waterResistance || product.specs?.waterResistance,
      caseSize: req.body.caseSize || product.specs?.caseSize
    };

    await product.save();

    res.json(product);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ GET single product
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};