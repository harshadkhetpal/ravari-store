#!/usr/bin/env node
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Ravari Store',
    time: new Date().toISOString(),
    port: PORT
  });
});

// Product list API
app.get('/api/products', (req, res) => {
  res.json([
    { id: 1, name: 'RAVARI Premium Brown Leather Sling Bag', price: 2499, sale: 1999 },
    { id: 2, name: 'RAVARI Boho-Chic Leather-Trim Tote Bag', price: 3499, sale: 2799 },
    { id: 3, name: 'RAVARI Premium Textured Leather Handbag', price: 4999 },
    { id: 4, name: 'RAVARI Vintage Brown Leather Crossbody', price: 2299, sale: 1699 },
    { id: 5, name: 'RAVARI Tool Apron Premium Leather', price: 1999, sale: 1499 },
    { id: 6, name: 'RAVARI Leather Document Organizer', price: 1799 },
    { id: 7, name: 'RAVARI Leather Jewelry Box', price: 2199, sale: 1799 },
    { id: 8, name: 'RAVARI Classic Brown Leather Messenger', price: 3299, sale: 2699 },
    { id: 9, name: 'RAVARI Leather Travel Organizer', price: 1599, sale: 1199 },
    { id: 10, name: 'RAVARI Leather Wallet Collection', price: 899, sale: 649 },
    { id: 11, name: 'RAVARI Designer Leather Belt', price: 1299, sale: 999 }
  ]);
});

// Homepage
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>RAVARI Store - Luxury Leather Goods</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; background: #f5f5f5; }
        header { background: linear-gradient(135deg, #d97706, #f59e0b); color: white; padding: 20px; text-align: center; }
        h1 { margin: 0; font-size: 2.5em; }
        .container { max-width: 1200px; margin: 20px auto; padding: 20px; }
        .products { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
        .product { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .product h3 { color: #d97706; margin: 10px 0; }
        .price { font-size: 1.2em; font-weight: bold; color: #333; }
        .sale { color: #ef4444; text-decoration: line-through; font-size: 0.9em; margin-right: 10px; }
        .status { background: #10b981; color: white; padding: 10px; text-align: center; border-radius: 4px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <header>
        <h1>🎉 RAVARI Store</h1>
        <p>Luxury Leather Goods - Officially Live on ravari.in</p>
      </header>
      <div class="container">
        <div class="status">✅ Server is running! Products loaded from API.</div>
        <h2>Featured Products</h2>
        <div class="products" id="products"></div>
      </div>
      <script>
        fetch('/api/products')
          .then(r => r.json())
          .then(products => {
            const html = products.map(p => \`
              <div class="product">
                <h3>\${p.name}</h3>
                <div class="price">
                  \${p.sale ? \`<span class="sale">₹\${p.price}</span>\` : ''}
                  ₹\${p.sale || p.price}
                </div>
              </div>
            \`).join('');
            document.getElementById('products').innerHTML = html;
          })
          .catch(e => {
            document.getElementById('products').innerHTML = '<p>Error loading products</p>';
            console.error(e);
          });
      </script>
    </body>
    </html>
  `);
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[RAVARI] Server running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
