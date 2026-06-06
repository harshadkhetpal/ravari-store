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
  {
    id: 1,
    name: 'RAVARI Vintage Brown Leather Sling Bag for Men & Women',
    slug: 'ravari-vintage-brown-leather-sling-bag',
    price: 4599, salePrice: 2599, category: 'Sling Bags',
    thumbnail: '/images/p1-a.png',
    images: ['/images/p1-a.png', '/images/p1-b.png', '/images/p1-c.png'],
    description: 'Compact vintage brown leather crossbody chest bag with multiple zippered compartments. Handcrafted for everyday versatility and timeless style.',
    stock: 18, isNew: true, isFeatured: true
  },
  {
    id: 2,
    name: 'RAVARI Premium Brown Leather Sling Bag for Men & Women',
    slug: 'ravari-premium-brown-leather-sling-bag',
    price: 4599, salePrice: 2599, category: 'Sling Bags',
    thumbnail: '/images/p2-a.png',
    images: ['/images/p2-a.png', '/images/p2-b.png', '/images/p2-c.png'],
    description: 'Premium full-grain brown leather sling bag with a stylish silhouette and durable hardware. The perfect blend of fashion and function.',
    stock: 15, isNew: true, isFeatured: true
  },
  {
    id: 3,
    name: 'RAVARI Boho-Chic Leather-Trim Tote Bag for Women',
    slug: 'ravari-boho-chic-leather-trim-tote-bag',
    price: 4499, salePrice: 2499, category: 'Tote Bags',
    thumbnail: '/images/p3-a.png',
    images: ['/images/p3-a.png', '/images/p3-b.png', '/images/p3-c.png'],
    description: 'Spacious boho-chic tote with premium leather trim and a soft woven body. Roomy enough for work, travel, and weekends.',
    stock: 12, isNew: false, isFeatured: true
  },
  {
    id: 4,
    name: 'RAVARI Premium Textured Leather Handbag',
    slug: 'ravari-premium-textured-leather-handbag',
    price: 4999, salePrice: null, category: 'Handbags',
    thumbnail: '/images/p4-a.png',
    images: ['/images/p4-a.png', '/images/p4-b.png'],
    description: 'Statement textured-leather handbag with structured form and refined detailing. A luxurious everyday companion.',
    stock: 8, isNew: true, isFeatured: true
  },
  {
    id: 5,
    name: 'RAVARI Artisan Leather Work Apron for Men & Women',
    slug: 'ravari-artisan-leather-work-apron',
    price: 2999, salePrice: 1599, category: 'Aprons',
    thumbnail: '/images/p5-a.png',
    images: ['/images/p5-a.png', '/images/p5-b.png', '/images/p5-c.png'],
    description: 'Durable artisan leather work apron with adjustable straps and practical pockets. Built for craftsmen, baristas, and creators.',
    stock: 25, isNew: false, isFeatured: true
  },
  {
    id: 6,
    name: 'RAVARI Premium Leather Jewellery Box',
    slug: 'ravari-premium-leather-jewellery-box',
    price: 4999, salePrice: null, category: 'Organizers',
    thumbnail: '/images/p6-a.jpg',
    images: ['/images/p6-a.jpg'],
    description: 'Handcrafted leather jewellery box with soft-lined compartments to keep your treasures organized and elegant.',
    stock: 10, isNew: false, isFeatured: true
  }
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
    slug VARCHAR(255),
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    salePrice DECIMAL(10,2) NULL,
    stock INT DEFAULT 0,
    category VARCHAR(100),
    thumbnail VARCHAR(255),
    images TEXT,
    isNew TINYINT(1) DEFAULT 0,
    isFeatured TINYINT(1) DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

async function seedRows() {
  for (const p of PRODUCTS) {
    await query(
      'INSERT INTO products (id, name, slug, description, price, salePrice, stock, category, thumbnail, images, isNew, isFeatured) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
      [p.id, p.name, p.slug, p.description, p.price, p.salePrice, p.stock, p.category, p.thumbnail, JSON.stringify(p.images || [p.thumbnail]), p.isNew ? 1 : 0, p.isFeatured ? 1 : 0]
    );
  }
  console.log(`[RAVARI] ✅ Seeded ${PRODUCTS.length} products into MySQL`);
}

async function setupSchemaAndSeed() {
  await query(CREATE_TABLE_SQL);
  // Detect old schema (missing slug column) -> rebuild cleanly
  const cols = await query("SHOW COLUMNS FROM products LIKE 'slug'");
  if (!cols || cols.length === 0) {
    console.log('[RAVARI] Old schema detected, rebuilding products table...');
    await query('DROP TABLE IF EXISTS products');
    await query(CREATE_TABLE_SQL);
    await seedRows();
    return;
  }
  const rows = await query('SELECT COUNT(*) AS c FROM products');
  if (rows[0].c === 0) {
    await seedRows();
  } else {
    console.log(`[RAVARI] ✅ ${rows[0].c} products already in MySQL`);
  }
}

// Normalize a DB row to the shape the frontend expects
function shapeRow(r) {
  let images = [];
  try { images = r.images ? JSON.parse(r.images) : []; } catch (_) { images = []; }
  return {
    id: r.id, name: r.name, slug: r.slug, description: r.description,
    price: Number(r.price), salePrice: r.salePrice != null ? Number(r.salePrice) : null,
    stock: r.stock, category: r.category, thumbnail: r.thumbnail,
    images, isNew: !!r.isNew, isFeatured: !!r.isFeatured
  };
}

async function getAllProducts() {
  if (dbReady && pool) {
    try {
      const rows = await query('SELECT * FROM products ORDER BY id ASC');
      if (rows && rows.length) return rows.map(shapeRow);
    } catch (err) { console.error('[RAVARI] products query failed:', err.message); }
  }
  return PRODUCTS;
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

// List all products (frontend expects { data: [...] })
fastify.get('/api/products', async (request) => {
  let all = await getAllProducts();
  const limit = request.query && request.query.limit ? parseInt(request.query.limit, 10) : null;
  if (limit && limit > 0) all = all.slice(0, limit);
  return { data: all, total: all.length };
});

// Featured products for homepage
fastify.get('/api/products/featured', async () => {
  const all = await getAllProducts();
  const featured = all.filter(p => p.isFeatured);
  return { data: featured.length ? featured : all };
});

// Product by slug (used by ProductDetail page)
fastify.get('/api/products/slug/:slug', async (request, reply) => {
  const slug = request.params.slug;
  const all = await getAllProducts();
  const product = all.find(p => p.slug === slug);
  if (!product) { reply.code(404); return { error: 'Product not found' }; }
  return { data: product };
});

// Product by numeric id
fastify.get('/api/products/:id', async (request, reply) => {
  const id = parseInt(request.params.id, 10);
  const all = await getAllProducts();
  const product = all.find(p => p.id === id);
  if (!product) { reply.code(404); return { error: 'Product not found' }; }
  return { data: product };
});

// Minimal admin login (so /admin works); credentials via env or defaults
fastify.post('/api/auth/login', async (request, reply) => {
  const { email, password } = request.body || {};
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@ravari.in';
  const adminPass = process.env.ADMIN_PASSWORD || 'ravari@2027';
  if (email === adminEmail && password === adminPass) {
    return { success: true, token: 'ravari-admin-' + Buffer.from(email).toString('base64'), user: { email, role: 'admin' } };
  }
  reply.code(401);
  return { success: false, error: 'Invalid credentials' };
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
