const express = require('express');
const router = express.Router();
const controller = require('../controllers/productController');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// create product WITH images
router.post('/', auth, upload.array('images', 5), controller.createProduct);

// keep this (optional separate upload)
router.post('/upload', upload.single('image'), (req, res) => {
  res.json({ url: req.file.location });
});

router.get('/', controller.getProducts);
router.delete('/:id', auth, controller.deleteProduct);
router.put('/:id', auth, upload.array('images', 5), controller.updateProduct);

module.exports = router;