#!/usr/bin/env node

/**
 * RAVARI Store Root Server
 * Entry point for Hostinger
 */

require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

// Log startup
console.log('╔════════════════════════════════════════╗');
console.log('║  RAVARI Store Server Starting          ║');
console.log('╚════════════════════════════════════════╝');
console.log(`⏰ Time: ${new Date().toISOString()}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'production'}`);
console.log(`🔌 Port: ${PORT}`);
console.log(`📂 Root: ${__dirname}`);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Ravari Store is running',
    timestamp: new Date().toISOString(),
    port: PORT,
    node: process.version
  });
});

// Serve frontend if build exists
const frontendBuild = path.join(__dirname, 'frontend', 'build');
if (fs.existsSync(frontendBuild)) {
  console.log('✅ Frontend build found, serving...');
  app.use(express.static(frontendBuild));

  // React Router fallback
  app.get('*', (req, res) => {
    const indexPath = path.join(frontendBuild, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ error: 'Frontend not found' });
    }
  });
} else {
  console.log('⚠️  Frontend build not found');

  // Fallback HTML
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ravari Store</title>
          <style>
            body { font-family: sans-serif; margin: 40px; background: #f5f5f5; }
            h1 { color: #d97706; }
            .container { background: white; padding: 20px; border-radius: 8px; max-width: 600px; }
            pre { background: #f0f0f0; padding: 10px; border-radius: 4px; overflow-x: auto; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🎉 Ravari Store</h1>
            <p>Server is running successfully!</p>
            <p>Frontend build is being prepared.</p>
            <h2>API Endpoints:</h2>
            <pre>/api/health - Health check</pre>
            <p><small>Last updated: ${new Date().toISOString()}</small></p>
          </div>
        </body>
      </html>
    `);
  });

  app.get('*', (req, res) => {
    res.status(404).json({
      error: 'Not found',
      path: req.path,
      message: 'Frontend build is not ready yet'
    });
  });
}

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ error: 'Server error', message: err.message });
});

// Start server
console.log(`\n⏳ Starting server on port ${PORT}...`);

try {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('╔════════════════════════════════════════╗');
    console.log('║  ✅ SERVER STARTED SUCCESSFULLY        ║');
    console.log('╚════════════════════════════════════════╝');
    console.log(`\n📍 URL: http://localhost:${PORT}`);
    console.log(`💊 Health: http://localhost:${PORT}/api/health\n`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('\n⏹️  SIGTERM received, shutting down gracefully...');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('\n⏹️  SIGINT received, shutting down gracefully...');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });

} catch (err) {
  console.error('❌ FAILED TO START SERVER');
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  process.exit(1);
}
