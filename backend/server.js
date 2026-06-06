#!/usr/bin/env node
const Fastify = require('fastify');
const path = require('path');
const fs = require('fs');

const fastify = Fastify({ logger: true, bodyLimit: 1048576 });

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

console.log(`[RAVARI] Starting server on ${HOST}:${PORT}`);

// ---------------------------------------------------------------------------
// Product catalogue (source of truth used to seed DB + as live fallback)
// ---------------------------------------------------------------------------
const PRODUCTS = [
  { id: 1,  name: 'RAVARI Premium Brown Leather Sling Bag', price: 2499, salePrice: 1999, category: 'Bags', thumbnail: '/images/1 (3).png', description: 'Elegant brown leather sling bag for everyday luxury.', stock: 15 },
  { id: 2,  name: 'RAVARI Boho-Chic Leather-Trim Tote Bag', price: 3499, salePrice: 2799, category: 'Bags', thumbnail: '/images/2 (3).png', description: 'Spacious boho-chic tote with premium leather trim.', stock: 12 },
  { id: 3,  name: 'RAVARI Premium Textured Leather Handbag', price: 4999, salePrice: null, category: 'Bags', thumbnail: '/images/3.png', description: 'Statement textured-leather handbag.', stock: 8 },
  { id: 4,  name: 'RAVARI Vintage Brown Leather Crossbody', price: 2299, salePrice: 1699, category: 'Bags', thumbnail: '/images/4 (3).png', description: 'Vintage-inspired crossbody in rich brown leather.', stock: 20 },
  { id: 5,  name: 'RAVARI Tool Apron Premium Leather', price: 1999, salePrice: 1499, category: 'Aprons', thumbnail: '/images/5.png', description: 'Durable premium-leather tool apron.', stock: 25 },
  { id: 6,  name: 'RAVARI Leather Document Organizer', price: 1799, salePrice: null, category: 'Organizers', thumbnail: '/images/6.png', description: 'Keep documents elegant and organized.', stock: 18 },
  { id: 7,  name: 'RAVARI Leather Jewelry Box', price: 2199, salePrice: 1799, category: 'Boxes', thumbnail: '/images/7.png', description: 'Handcrafted leather jewelry box.', stock: 10 },
  { id: 8,  name: 'RAVARI Classic Brown Leather Messenger', price: 3299, salePrice: 2699, category: 'Bags', thumbnail: '/images/8.png', description: 'Classic messenger bag for work and travel.', stock: 14 },
  { id: 9,  name: 'RAVARI Leather Travel Organizer', price: 1599, salePrice: 1199, category: 'Organizers', thumbnail: '/images/9.png', description: 'Compact travel organizer in fine leather.', stock: 22 },
  { id: 10, name: 'RAVARI Leather Wallet Collection', price: 899, salePrice: 649, category: 'Wallets', thumbnail: '/images/10.png', description: 'Slim, refined leather wallet.', stock: 40 },
  { id: 11, name: 'RAVARI Designer Leather Belt', price: 1299, salePrice: 999, category: 'Belts', thumbnail: '/images/11.png', description: 'Designer leather belt with signature buckle.', stock: 30 }
];

// ---------------------------------------------------------------------------
// Database (best-effort: never blocks or crashes the server)
// ---------------------------------------------------------------------------
let dbReady = false;
let dbError = null;
let dbHostUsed = null;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// Pure-JS `mysql` driver loads in Hostinger's sandbox (mysql2 does not).
let pool = null;

function makePool(host) {
  const mysql = require('mysql');
  return mysql.createPool({
    connectionLimit: 5,
    host,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'u800235524_ravari_user',
    password: process.env.DB_PASSWORD || 'Ravari@2026Secure123!',
    database: process.env.DB_NAME || 'u800235524_ravari_store',
    connectTimeout: 8000
  });
}

function query(sql, params) {
  return new Promise((resolve, reject) => {
    pool.query(sql, params || [], (err, results) => {
      if (err) reject(err); else resolve(results);
    });
  });
}

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    salePrice DECIMAL(10,2) NULL,
    stock INT DEFAULT 0,
    category VARCHAR(100),
    thumbnail VARCHAR(255),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

async function setupSchemaAndSeed() {
  await query(CREATE_TABLE_SQL);
  const rows = await query('SELECT COUNT(*) AS c FROM products');
  const count = rows[0].c;
  if (count === 0) {
    for (const p of PRODUCTS) {
      await query(
        'INSERT INTO products (id, name, description, price, salePrice, stock, category, thumbnail) VALUES (?,?,?,?,?,?,?,?)',
        [p.id, p.name, p.description, p.price, p.salePrice, p.stock, p.category, p.thumbnail]
      );
    }
    console.log('[RAVARI] ✅ Seeded 11 products into MySQL');
  } else {
    console.log(`[RAVARI] ✅ ${count} products already in MySQL`);
  }
}

async function initDatabase() {
  const hosts = [process.env.DB_HOST, 'localhost', '127.0.0.1'].filter(Boolean);
  const errors = [];
  for (let attempt = 1; attempt <= 3; attempt++) {
    for (const host of hosts) {
      try {
        console.log(`[RAVARI] DB attempt ${attempt} via ${host} (mysql driver)...`);
        pool = makePool(host);
        await query('SELECT 1');         // verify connection
        await setupSchemaAndSeed();      // create table + seed
        dbReady = true;
        dbError = null;
        dbHostUsed = host;
        console.log(`[RAVARI] ✅ Database connected via ${host}`);
        return;
      } catch (err) {
        errors.push(`${host}:${err.code || ''} ${err.message}`);
        console.error(`[RAVARI] ⚠️  DB failed ${host}: ${err.message}`);
        try { if (pool) pool.end(() => {}); } catch (_) {}
        pool = null;
      }
    }
    dbError = errors.slice(-3).join(' | ');
    await sleep(2000);
  }
  console.error('[RAVARI] ⚠️  All DB attempts failed, using fallback data');
}

// ---------------------------------------------------------------------------
// Static React frontend
// ---------------------------------------------------------------------------
const buildPath = path.join(__dirname, '../frontend/build');
if (fs.existsSync(path.join(buildPath, 'index.html'))) {
  console.log(`[RAVARI] Serving React frontend from ${buildPath}`);
  fastify.register(require('@fastify/static'), { root: buildPath, prefix: '/' });
} else {
  console.log(`[RAVARI] ⚠️  React build not found at ${buildPath}`);
}

// ---------------------------------------------------------------------------
// API routes
// ---------------------------------------------------------------------------
fastify.get('/api/health', async () => ({
  status: 'ok',
  app: 'Ravari Store',
  database: dbReady ? 'connected' : 'fallback',
  dbHost: dbHostUsed,
  dbError: dbError,
  time: new Date().toISOString()
}));

fastify.get('/api/products', async () => {
  if (dbReady && pool) {
    try {
      const rows = await query('SELECT id, name, description, price, salePrice, stock, category, thumbnail FROM products ORDER BY id ASC');
      if (rows && rows.length) return rows;
    } catch (err) {
      console.error('[RAVARI] products query failed:', err.message);
    }
  }
  return PRODUCTS;
});

fastify.get('/api/products/:id', async (request, reply) => {
  const id = parseInt(request.params.id, 10);
  if (dbReady && pool) {
    try {
      const rows = await query('SELECT id, name, description, price, salePrice, stock, category, thumbnail FROM products WHERE id = ?', [id]);
      if (rows && rows.length) return rows[0];
    } catch (err) {
      console.error('[RAVARI] product query failed:', err.message);
    }
  }
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) { reply.code(404); return { error: 'Product not found' }; }
  return product;
});

// SPA fallback -> index.html
fastify.setNotFoundHandler((request, reply) => {
  const indexPath = path.join(buildPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    reply.type('text/html').send(fs.readFileSync(indexPath));
  } else {
    reply.code(404).send({ error: 'Not found' });
  }
});

// ---------------------------------------------------------------------------
// Start — listen FIRST so the site is always reachable, then init DB
// ---------------------------------------------------------------------------
fastify.listen({ port: PORT, host: HOST })
  .then(() => {
    console.log(`[RAVARI] ✅ Listening on ${HOST}:${PORT}`);
    initDatabase(); // background, non-blocking
  })
  .catch((err) => {
    fastify.log.error(err);
    process.exit(1);
  });

process.on('SIGTERM', () => fastify.close().then(() => process.exit(0)));
process.on('SIGINT', () => fastify.close().then(() => process.exit(0)));
