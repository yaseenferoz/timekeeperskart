const Product = require('../models/Product');
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../utils/s3");


// ✅ GET all products (with filters + pagination)
exports.getProducts = async (req, res) => {
  try {
    const { brand, gender, category, minPrice, maxPrice, search, page = 1 } = req.query;

    let filter = {};

    if (brand) filter.brand = brand;
    if (gender) filter.gender = gender;

    // ✅ NEW
    if (category) filter.category = category;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

const pageNumber = Number(page) || 1;
const limit = req.query.limit ? Number(req.query.limit) : null;

let query = Product.find(filter).sort({ createdAt: -1 });

if (limit) {
  const skip = (pageNumber - 1) * limit;
  query = query.skip(skip).limit(limit);
}

const products = await query;

res.json(products);
 

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ CREATE product (UPDATED)
exports.createProduct = async (req, res) => {
  try {
    const { name, price } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    const imageUrls = req.files ? req.files.map(file => file.location) : [];

    const product = new Product({
      name,
      brand: req.body.brand,
      price: Number(price),
      gender: req.body.gender,

      // ✅ NEW
      category: req.body.category,

      // existing watch fields
      movement: req.body.movement,
      style: req.body.style,

      description: req.body.description,

      images: imageUrls,

      specs: {
        dialColor: req.body.dialColor,
        strapMaterial: req.body.strapMaterial,
        waterResistance: req.body.waterResistance,
        caseSize: req.body.caseSize
      },

      // ✅ NEW FLEXIBLE ATTRIBUTES
      attributes: {
        lens: req.body.lens,
        uv: req.body.uv,
        size: req.body.size,
        material: req.body.material,
        battery: req.body.battery,
        display: req.body.display
      }
    });

    await product.save();

    res.status(201).json(product);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};


// ✅ DELETE product (same)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

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


// ✅ UPDATE product (UPDATED)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Replace images if new uploaded
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

    // Basic fields
    product.name = req.body.name || product.name;
    product.brand = req.body.brand || product.brand;
    product.price = req.body.price ? Number(req.body.price) : product.price;
    product.gender = req.body.gender || product.gender;

    // ✅ NEW
    product.category = req.body.category || product.category;

    // Watch fields
    product.movement = req.body.movement || product.movement;
    product.style = req.body.style || product.style;

    product.description = req.body.description || product.description;

    product.specs = {
      dialColor: req.body.dialColor || product.specs?.dialColor,
      strapMaterial: req.body.strapMaterial || product.specs?.strapMaterial,
      waterResistance: req.body.waterResistance || product.specs?.waterResistance,
      caseSize: req.body.caseSize || product.specs?.caseSize
    };

    // ✅ NEW dynamic attributes
    product.attributes = {
      lens: req.body.lens || product.attributes?.lens,
      uv: req.body.uv || product.attributes?.uv,
      size: req.body.size || product.attributes?.size,
      material: req.body.material || product.attributes?.material,
      battery: req.body.battery || product.attributes?.battery,
      display: req.body.display || product.attributes?.display
    };

    await product.save();

    res.json(product);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ GET single product (same)
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