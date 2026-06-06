#!/usr/bin/env node
const Fastify = require('fastify');

const fastify = Fastify({
  logger: true,
  bodyLimit: 1048576
});

const PORT = parseInt(process.env.PORT || '8080');
const HOST = process.env.HOST || '0.0.0.0';

console.log(`[RAVARI] Starting Fastify server on ${HOST}:${PORT}`);

// Health check
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

// Homepage
fastify.get('/', async (request, reply) => {
  return {
    message: 'Ravari Store - Luxury Leather Goods',
    status: 'running',
    version: '1.0.0',
    api: '/api/health'
  };
});

// Single product detail
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

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`[RAVARI] ✅ Fastify server running on http://${HOST}:${PORT}`);
    console.log(`[RAVARI] Health check: http://${HOST}:${PORT}/api/health`);
    console.log(`[RAVARI] Products: http://${HOST}:${PORT}/api/products`);
  } catch (err) {
    console.error('[RAVARI] ❌ Failed to start server:', err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[RAVARI] SIGTERM received, shutting down...');
  await fastify.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[RAVARI] SIGINT received, shutting down...');
  await fastify.close();
  process.exit(0);
});

start();
