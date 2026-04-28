require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// ✅ Middleware (IMPORTANT FIX)
app.use(cors());
app.use(express.json({ limit: "50mb" })); // ✅ increase limit
app.use(express.urlencoded({ limit: "50mb", extended: true })); // ✅ for form-data

// Routes
const productRoutes = require('./routes/productRoutes');
app.use('/api/products', productRoutes);

const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

// Root route
app.get('/', (req, res) => {
  res.send("Backend + DB running 🚀");
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected ✅");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });

  })
  .catch(err => console.log("MongoDB Error ❌", err));