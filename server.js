require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const productRoutes = require('./routes/productRoutes');
app.use('/api/products', productRoutes);


const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);
// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected ✅");
    
    // Start server ONLY after DB is connected
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  })
  .catch(err => console.log("MongoDB Error ❌", err));
  res.send("Backend LIVE 🚀 v2");

// Test route
app.get('/', (req, res) => {
  res.send("Backend + DB running 🚀");
});