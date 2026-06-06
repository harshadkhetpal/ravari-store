#!/usr/bin/env node
const Fastify = require('fastify');
const path = require('path');
const fs = require('fs');

const fastify = Fastify({
  logger: true,
  bodyLimit: 1048576
});

const PORT = process.env.PORT;
const HOST = '0.0.0.0';

console.log(`[RAVARI] Initializing Fastify server`);
console.log(`[RAVARI] PORT: ${PORT}`);
console.log(`[RAVARI] HOST: ${HOST}`);

// Serve static files from React build
const buildPath = path.join(__dirname, '../frontend/build');
if (fs.existsSync(buildPath)) {
  console.log(`[RAVARI] Serving React frontend from: ${buildPath}`);
  fastify.register(require('@fastify/static'), {
    root: buildPath,
    prefix: '/'
  });
} else {
  console.log(`[RAVARI] ⚠️  React build not found at ${buildPath}`);
}

// Health check API
fastify.get('/api/health', async (request, reply) => {
  return {
    status: 'ok',
    app: 'Ravari Store',
    time: new Date().toISOString(),
    port: PORT
  };
});

// Products API
fastify.get('/api/products', async (request, reply) => {
  return [
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
  ];
});

// Product detail
fastify.get('/api/products/:id', async (request, reply) => {
  const products = [
    { id: 1, name: 'RAVARI Premium Brown Leather Sling Bag', price: 2499, sale: 1999, desc: 'Elegant brown leather sling bag' },
    { id: 2, name: 'RAVARI Boho-Chic Leather-Trim Tote Bag', price: 3499, sale: 2799, desc: 'Stylish tote bag with leather accents' },
    { id: 3, name: 'RAVARI Premium Textured Leather Handbag', price: 4999, desc: 'Premium handbag with textured finish' }
  ];
  const product = products.find(p => p.id === parseInt(request.params.id));
  if (!product) {
    reply.code(404);
    return { error: 'Product not found' };
  }
  return product;
});

// SPA fallback - serve index.html for all unmatched routes
fastify.setNotFoundHandler((request, reply) => {
  const indexPath = path.join(buildPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    reply.sendFile('index.html');
  } else {
    reply.code(404).send({ error: 'Not found' });
  }
});

// Start listening
fastify.listen({ port: PORT, host: HOST })
  .then(() => console.log(`[RAVARI] ✅ Listening on ${HOST}:${PORT}`))
  .catch((err) => {
    fastify.log.error(err);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[RAVARI] SIGTERM received, shutting down...');
  fastify.close().then(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('[RAVARI] SIGINT received, shutting down...');
  fastify.close().then(() => process.exit(0));
});
