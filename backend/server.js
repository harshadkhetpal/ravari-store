require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files - Frontend build
const frontendBuild = path.join(__dirname, '../frontend/build');
const fs = require('fs');

// Check if frontend build exists, if not create a simple fallback
if (fs.existsSync(frontendBuild)) {
  app.use(express.static(frontendBuild));
} else {
  console.log('⚠️  Frontend build not found, will serve from public...');
  app.use(express.static(path.join(__dirname, 'public')));
}

// Product images
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ravari', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB error:', err));

// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/auth', require('./routes/auth'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Ravari API is running' });
});

// Serve React app for all non-API routes (SPA fallback)
app.get('*', (req, res) => {
  const indexPath = path.join(frontendBuild, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Fallback response if no frontend build
    res.send('<h1>Ravari API Server</h1><p>Frontend build not available. API endpoints are functional.</p>');
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Ravari backend running on port ${PORT}`);
});
