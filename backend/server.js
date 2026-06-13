#!/usr/bin/env node
const Fastify = require('fastify');
const path = require('path');
const fs = require('fs');

const fastify = Fastify({ logger: true, bodyLimit: 26214400 });

// File uploads (product images)
fastify.register(require('@fastify/multipart'), { limits: { fileSize: 25 * 1024 * 1024 } });

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Uploads directory (admin-uploaded product images)
const uploadsDir = path.join(__dirname, 'public', 'uploads');
try { fs.mkdirSync(uploadsDir, { recursive: true }); } catch (_) {}

console.log(`[RAVARI] Starting server on ${HOST}:${PORT}`);

// ---------------------------------------------------------------------------
// Product catalogue (rich shape used by the full React frontend)
// ---------------------------------------------------------------------------
function img(url, alt) { return { url, alt }; }

const PRODUCTS = [
  {
    id: 3, _id: '3',
    name: 'RAVARI Boho-Chic Leather-Trim Tote Bag for Women | Boho Tribal Canvas Handbag | Stylish Everyday Fashion Carry for Office, Travel & Casual Use',
    slug: 'ravari-boho-chic-leather-trim-tote-bag',
    price: 4499, salePrice: 2499, category: 'Tote Bags',
    thumbnail: '/static/products/tote-boho/img1.png',
    images: [
      img('/static/products/tote-boho/img1.png', 'RAVARI Boho Tote Bag — Front View'),
      img('/static/products/tote-boho/img2.png', 'RAVARI Boho Tote — Features'),
      img('/static/products/tote-boho/img3.png', 'RAVARI Boho Tote — Designed To Carry All'),
      img('/static/products/tote-boho/img4.png', 'RAVARI Boho Tote — Spacious Compartments'),
      img('/static/products/tote-boho/img5.png', 'RAVARI Boho Tote — Model Shot'),
    ],
    description: 'Boho Tribal Canvas Handbag with genuine leather trim and braided detailing. Spacious enough for a 16" laptop, water bottle, wallet & more. 3 main compartments with centre zippered divider. Dimensions: 16" × 14" × 5". Top Zip Closure | Comfortable Leather Handles | Durable Reinforced Stitching.',
    longDescription: 'A statement piece that blends artisan craft with everyday utility. Handwoven tribal canvas body with genuine leather trim. Perfect for office, travel and casual use.',
    material: ['Genuine Leather', 'Tribal Canvas', 'Braided Leather Trim'],
    dimensions: { length: '16"', width: '5"', height: '14"' },
    stock: 20, isNew: true, isFeatured: true, rating: 4.8, reviewCount: 0
  },
  {
    id: 4, _id: '4',
    name: 'RAVARI Leather Jewellery Box Organizer for Women with Mirror & Drawers | Multi Layer Jewelry Storage Case for Rings Earrings Necklace | Travel Friendly',
    slug: 'ravari-leather-jewellery-box-organizer',
    price: 5499, salePrice: 4199, category: 'Jewellery Box',
    thumbnail: '/static/products/jewellery-box/img1.png',
    images: [
      img('/static/products/jewellery-box/img1.png', 'RAVARI Jewellery Box — Dimensions'),
      img('/static/products/jewellery-box/img2.png', 'RAVARI Jewellery Box — Lifestyle'),
      img('/static/products/jewellery-box/img3.png', 'RAVARI Jewellery Box — Open View'),
      img('/static/products/jewellery-box/img4.png', 'RAVARI Jewellery Box — Features'),
      img('/static/products/jewellery-box/img5.png', 'RAVARI Jewellery Box — Interior'),
      img('/static/products/jewellery-box/img6.png', 'RAVARI Jewellery Box — Engineered for Elegance'),
    ],
    description: '3-Tier Jewellery Box with built-in mirror, secure lock & key, and plush velvet interior. Stores rings, earrings, necklaces, bracelets & watches. Premium crocodile-pattern leather exterior with silver hardware. Dimensions: 8" × 6" × 5.5". Perfect for home & travel.',
    longDescription: 'Engineered for secure elegance. The RAVARI Jewellery Box features 3 pull-out tiers with a built-in mirror in the lid, a lockable clasp, and soft velvet-lined compartments. Premium crocodile-embossed leather with sturdy metallic handle and silver hardware accents.',
    material: ['Crocodile-Pattern Leather', 'Velvet Lining', 'Silver Hardware'],
    dimensions: { length: '8"', width: '6"', height: '5.5"' },
    stock: 15, isNew: true, isFeatured: true, rating: 4.9, reviewCount: 0
  },
  {
    id: 5, _id: '5',
    name: 'RAVARI Watch Box Holder Organizer for Men & Women | PU Leather with Crocodile-Embossed Dark Brown Texture',
    slug: 'ravari-watch-box-holder-organizer',
    price: 3299, salePrice: 2799, category: 'Watch Box',
    thumbnail: '/static/products/watch-box/12slot/img1.png',
    images: [
      img('/static/products/watch-box/12slot/img1.png', 'RAVARI Watch Box 12 Slot — Front'),
      img('/static/products/watch-box/12slot/img2.png', 'RAVARI Watch Box 12 Slot — Open'),
      img('/static/products/watch-box/12slot/img3.png', 'RAVARI Watch Box 12 Slot — Detail'),
      img('/static/products/watch-box/12slot/img4.png', 'RAVARI Watch Box 12 Slot — Interior'),
      img('/static/products/watch-box/12slot/img5.png', 'RAVARI Watch Box 12 Slot — Lifestyle'),
    ],
    description: 'Premium PU Leather Watch Box with crocodile-embossed dark brown texture. Soft velvet-lined individual slots keep every watch scratch-free and securely displayed. Available in 8, 12 and 20 slot variants.',
    variantLabel: 'Slots',
    variants: [
      {
        id: '12slot', label: '12 Slots',
        price: 3299, salePrice: 2799, stock: 15,
        thumbnail: '/static/products/watch-box/12slot/img1.png',
        images: [
          img('/static/products/watch-box/12slot/img1.png', 'Watch Box 12 Slot — Front'),
          img('/static/products/watch-box/12slot/img2.png', 'Watch Box 12 Slot — Open'),
          img('/static/products/watch-box/12slot/img3.png', 'Watch Box 12 Slot — Detail'),
          img('/static/products/watch-box/12slot/img4.png', 'Watch Box 12 Slot — Interior'),
          img('/static/products/watch-box/12slot/img5.png', 'Watch Box 12 Slot — Lifestyle'),
        ],
      },
      {
        id: '8slot', label: '8 Slots',
        price: 3999, salePrice: 2299, stock: 15,
        thumbnail: '/static/products/watch-box/8slot/img1.png',
        images: [
          img('/static/products/watch-box/8slot/img1.png', 'Watch Box 8 Slot — Front'),
          img('/static/products/watch-box/8slot/img2.png', 'Watch Box 8 Slot — Open'),
          img('/static/products/watch-box/8slot/img3.png', 'Watch Box 8 Slot — Detail'),
          img('/static/products/watch-box/8slot/img4.png', 'Watch Box 8 Slot — Interior'),
          img('/static/products/watch-box/8slot/img5.png', 'Watch Box 8 Slot — Lifestyle'),
          img('/static/products/watch-box/8slot/img6.png', 'Watch Box 8 Slot — Features'),
        ],
      },
      {
        id: '20slot', label: '20 Slots',
        price: 7999, salePrice: 5999, stock: 10,
        thumbnail: '/static/products/watch-box/20slot/img1.jpg',
        images: [
          img('/static/products/watch-box/20slot/img1.jpg', 'Watch Box 20 Slot — Front'),
          img('/static/products/watch-box/20slot/img2.jpg', 'Watch Box 20 Slot — Open'),
          img('/static/products/watch-box/20slot/img3.jpg', 'Watch Box 20 Slot — Detail'),
          img('/static/products/watch-box/20slot/img4.jpg', 'Watch Box 20 Slot — Interior'),
          img('/static/products/watch-box/20slot/img5.jpg', 'Watch Box 20 Slot — Lifestyle'),
        ],
      },
    ],
    stock: 15, isNew: true, isFeatured: true, rating: 4.9, reviewCount: 0
  },
  {
    id: 6, _id: '6',
    name: 'RAVARI Artisan Leather Work Apron for Men & Women | Heavy-Duty Multi-Pocket Electrician, Craft, Barber, Kitchen & Workshop Apron with Adjustable Shoulder Strap',
    slug: 'ravari-artisan-leather-work-apron',
    price: 2999, salePrice: 1899, category: 'Aprons',
    thumbnail: '/static/products/work-apron/img1.png',
    images: [
      img('/static/products/work-apron/img1.png', 'RAVARI Work Apron — Front View'),
      img('/static/products/work-apron/img2.png', 'RAVARI Work Apron — Detail'),
      img('/static/products/work-apron/img3.png', 'RAVARI Work Apron — Pockets'),
      img('/static/products/work-apron/img4.png', 'RAVARI Work Apron — Lifestyle'),
      img('/static/products/work-apron/img5.png', 'RAVARI Work Apron — Features'),
      img('/static/products/work-apron/img6.png', 'RAVARI Work Apron — Strap Detail'),
      img('/static/products/work-apron/img7.png', 'RAVARI Work Apron — Model Shot'),
    ],
    description: 'Heavy-duty genuine leather work apron with multiple deep pockets for tools, accessories, and essentials. Adjustable shoulder strap fits all body types. Ideal for electricians, carpenters, barbers, chefs, and craftsmen. Durable reinforced stitching built to last.',
    material: ['Genuine Leather', 'Reinforced Stitching', 'Adjustable Straps'],
    stock: 25, isNew: true, isFeatured: true, rating: 4.8, reviewCount: 0
  },
  {
    id: 7, _id: '7',
    name: 'RAVARI Leather Sling Bag for Men & Women | Stylish Crossbody Chest Bag | Travel & Daily Use',
    slug: 'ravari-leather-sling-bag',
    price: 4599, salePrice: 2599, category: 'Sling Bags',
    thumbnail: '/static/products/sling-bag/premium/img1.png',
    images: [
      img('/static/products/sling-bag/premium/img1.png', 'RAVARI Premium Sling Bag — Front'),
      img('/static/products/sling-bag/premium/img2.png', 'RAVARI Premium Sling Bag — Side'),
      img('/static/products/sling-bag/premium/img3.png', 'RAVARI Premium Sling Bag — Detail'),
      img('/static/products/sling-bag/premium/img4.png', 'RAVARI Premium Sling Bag — Interior'),
      img('/static/products/sling-bag/premium/img5.png', 'RAVARI Premium Sling Bag — Lifestyle'),
      img('/static/products/sling-bag/premium/img6.png', 'RAVARI Premium Sling Bag — Features'),
      img('/static/products/sling-bag/premium/img7.png', 'RAVARI Premium Sling Bag — Model'),
    ],
    description: 'Stylish crossbody chest bag in premium brown leather with zipper pocket and adjustable strap. Compact yet spacious — perfect for travel and daily use.',
    material: ['Genuine Leather', 'YKK Zipper', 'Adjustable Strap'],
    variantLabel: 'Style',
    variants: [
      {
        id: 'premium', label: 'Premium',
        price: 4599, salePrice: 2599, stock: 18,
        thumbnail: '/static/products/sling-bag/premium/img1.png',
        images: [
          img('/static/products/sling-bag/premium/img1.png', 'Premium Sling Bag — Front'),
          img('/static/products/sling-bag/premium/img2.png', 'Premium Sling Bag — Side'),
          img('/static/products/sling-bag/premium/img3.png', 'Premium Sling Bag — Detail'),
          img('/static/products/sling-bag/premium/img4.png', 'Premium Sling Bag — Interior'),
          img('/static/products/sling-bag/premium/img5.png', 'Premium Sling Bag — Lifestyle'),
          img('/static/products/sling-bag/premium/img6.png', 'Premium Sling Bag — Features'),
          img('/static/products/sling-bag/premium/img7.png', 'Premium Sling Bag — Model'),
        ],
      },
      {
        id: 'vintage', label: 'Vintage',
        price: 4599, salePrice: 2599, stock: 18,
        thumbnail: '/static/products/sling-bag/vintage/img1.png',
        images: [
          img('/static/products/sling-bag/vintage/img1.png', 'Vintage Sling Bag — Front'),
          img('/static/products/sling-bag/vintage/img2.png', 'Vintage Sling Bag — Side'),
          img('/static/products/sling-bag/vintage/img3.png', 'Vintage Sling Bag — Detail'),
          img('/static/products/sling-bag/vintage/img4.png', 'Vintage Sling Bag — Interior'),
          img('/static/products/sling-bag/vintage/img5.png', 'Vintage Sling Bag — Lifestyle'),
        ],
      },
    ],
    stock: 18, isNew: true, isFeatured: true, rating: 4.9, reviewCount: 0
  },
  {
    id: 8, _id: '8',
    name: 'Ravari Ember Travel Folio Leather Wallet with Card Slots & Passport Organizer',
    slug: 'ravari-ember-travel-folio-leather-wallet',
    price: 1000, salePrice: 799, category: 'Wallets',
    thumbnail: '/static/products/travel-folio/img1.png',
    images: [
      img('/static/products/travel-folio/img1.png', 'Ravari Ember Travel Folio — Front'),
      img('/static/products/travel-folio/img2.png', 'Ravari Ember Travel Folio — Open View'),
      img('/static/products/travel-folio/img3.png', 'Ravari Ember Travel Folio — Card Slots'),
      img('/static/products/travel-folio/img4.png', 'Ravari Ember Travel Folio — Passport'),
      img('/static/products/travel-folio/img5.png', 'Ravari Ember Travel Folio — Lifestyle'),
    ],
    description: 'Compact leather travel folio with dedicated card slots and passport organizer. Keep your cards, cash, boarding pass and passport organized in one sleek leather wallet. Perfect travel companion.',
    material: ['Genuine Leather', 'Card Slots', 'Passport Sleeve'],
    stock: 30, isNew: true, isFeatured: true, rating: 4.7, reviewCount: 0
  },
  {
    id: 9, _id: '9',
    name: 'Ravari Leather Women Handbag – Crocodile-Textured Designer Tote with Braided Flap Closure',
    slug: 'ravari-croc-textured-women-handbag',
    price: 2799, salePrice: 1599, category: 'Handbags',
    thumbnail: '/static/products/croc-handbag/brown/img1.jpg',
    images: [
      img('/static/products/croc-handbag/brown/img1.jpg', 'Ravari Croc Handbag — Front'),
      img('/static/products/croc-handbag/brown/img2.jpg', 'Ravari Croc Handbag — Side'),
      img('/static/products/croc-handbag/brown/img3.jpg', 'Ravari Croc Handbag — Detail'),
      img('/static/products/croc-handbag/brown/img4.jpg', 'Ravari Croc Handbag — Interior'),
      img('/static/products/croc-handbag/brown/img5.jpg', 'Ravari Croc Handbag — Lifestyle'),
    ],
    description: 'Elegant crocodile-textured designer tote with signature braided flap closure. Spacious interior with structured silhouette — the perfect statement handbag for every occasion.',
    material: ['Crocodile-Textured Leather', 'Braided Closure', 'Structured Body'],
    variantLabel: 'Colour',
    variants: [
      {
        id: 'brown', label: 'Brown',
        price: 2799, salePrice: 1599, stock: 20,
        thumbnail: '/static/products/croc-handbag/brown/img1.jpg',
        images: [
          img('/static/products/croc-handbag/brown/img1.jpg', 'Croc Handbag Brown — Front'),
          img('/static/products/croc-handbag/brown/img2.jpg', 'Croc Handbag Brown — Side'),
          img('/static/products/croc-handbag/brown/img3.jpg', 'Croc Handbag Brown — Detail'),
          img('/static/products/croc-handbag/brown/img4.jpg', 'Croc Handbag Brown — Interior'),
          img('/static/products/croc-handbag/brown/img5.jpg', 'Croc Handbag Brown — Lifestyle'),
        ],
      },
      {
        id: 'black', label: 'Black',
        price: 2799, salePrice: 1599, stock: 20,
        thumbnail: '/static/products/croc-handbag/img1.png',
        images: [
          img('/static/products/croc-handbag/img1.png', 'Croc Handbag Black — Front'),
          img('/static/products/croc-handbag/img2.png', 'Croc Handbag Black — Side'),
          img('/static/products/croc-handbag/img3.png', 'Croc Handbag Black — Detail'),
          img('/static/products/croc-handbag/img4.png', 'Croc Handbag Black — Interior'),
          img('/static/products/croc-handbag/img5.png', 'Croc Handbag Black — Lifestyle'),
        ],
      },
      {
        id: 'green', label: 'Emerald Green',
        price: 2799, salePrice: 1599, stock: 20,
        thumbnail: '/static/products/croc-handbag/green/img1.png',
        images: [
          img('/static/products/croc-handbag/green/img1.png', 'Croc Handbag Green — Front'),
          img('/static/products/croc-handbag/green/img2.png', 'Croc Handbag Green — Side'),
          img('/static/products/croc-handbag/green/img3.png', 'Croc Handbag Green — Detail'),
          img('/static/products/croc-handbag/green/img4.png', 'Croc Handbag Green — Interior'),
          img('/static/products/croc-handbag/green/img5.png', 'Croc Handbag Green — Lifestyle'),
        ],
      },
    ],
    stock: 20, isNew: true, isFeatured: true, rating: 4.8, reviewCount: 0
  },
  {
    id: 10, _id: '10',
    name: 'RAVARI Premium Leather Key Holder with Zipper Pouch & Metal Keychain | Compact Key Organizer for Car & Home Keys',
    slug: 'ravari-premium-leather-key-holder',
    price: 599, salePrice: 499, category: 'Accessories',
    thumbnail: '/static/products/key-holder/img1.jpg',
    images: [
      img('/static/products/key-holder/img1.jpg', 'RAVARI Key Holder — Front'),
      img('/static/products/key-holder/img2.jpg', 'RAVARI Key Holder — Open'),
      img('/static/products/key-holder/img3.jpg', 'RAVARI Key Holder — Detail'),
      img('/static/products/key-holder/img4.jpg', 'RAVARI Key Holder — Keychain'),
      img('/static/products/key-holder/img5.jpg', 'RAVARI Key Holder — Lifestyle'),
    ],
    description: 'Compact leather key holder with zippered pouch and sturdy metal keychain. Keeps car and home keys organized, scratch-free and always within reach. Premium leather finish with reinforced stitching.',
    material: ['Genuine Leather', 'Metal Keychain', 'YKK Zipper'],
    stock: 50, isNew: true, isFeatured: true, rating: 4.7, reviewCount: 0
  },
  {
    id: 11, _id: '11',
    name: 'RAVARI Premium Leather Desk Organizer with Pen Stand, Card Holder & Utility Tray | Office Table Organizer for Home & Workspace',
    slug: 'ravari-premium-leather-desk-organizer',
    price: 1299, salePrice: 1199, category: 'Accessories',
    thumbnail: '/static/products/desk-organizer/img1.jpg',
    images: [
      img('/static/products/desk-organizer/img1.jpg', 'RAVARI Desk Organizer — Front'),
      img('/static/products/desk-organizer/img2.jpg', 'RAVARI Desk Organizer — Pen Stand'),
      img('/static/products/desk-organizer/img3.jpg', 'RAVARI Desk Organizer — Card Holder'),
      img('/static/products/desk-organizer/img4.jpg', 'RAVARI Desk Organizer — Utility Tray'),
      img('/static/products/desk-organizer/img5.jpg', 'RAVARI Desk Organizer — Lifestyle'),
    ],
    description: 'Premium leather desk organizer with dedicated pen stand, card holder and utility tray. Keeps your workspace clean, organized and elegant. Crafted from genuine leather with reinforced base.',
    material: ['Genuine Leather', 'Reinforced Base', 'Metal Accents'],
    stock: 30, isNew: true, isFeatured: true, rating: 4.8, reviewCount: 0
  },
];

// In-memory reviews (per productId). Persisted across requests, reset on restart.
const REVIEWS = {};

// ---------------------------------------------------------------------------
// Database (best-effort via pure-JS `mysql` driver; mysql2 fails on Hostinger)
// ---------------------------------------------------------------------------
let dbReady = false;
let dbError = null;
let dbHostUsed = null;
let pool = null;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function makePool(host) {
  const mysql = require('mysql');
  return mysql.createPool({
    connectionLimit: 5, host, port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'u800235524_ravari_user',
    password: process.env.DB_PASSWORD || 'Ravari@2026Secure123!',
    database: process.env.DB_NAME || 'u800235524_ravari_store',
    connectTimeout: 8000
  });
}
function query(sql, params) {
  return new Promise((resolve, reject) => {
    pool.query(sql, params || [], (err, results) => { if (err) reject(err); else resolve(results); });
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
    rating DECIMAL(3,1) DEFAULT 0,
    reviewCount INT DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

async function seedRows() {
  for (const p of PRODUCTS) {
    await query(
      'INSERT INTO products (id, name, slug, description, price, salePrice, stock, category, thumbnail, images, isNew, isFeatured, rating, reviewCount) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [p.id, p.name, p.slug, p.description, p.price, p.salePrice, p.stock, p.category, p.thumbnail, JSON.stringify(p.images || []), p.isNew ? 1 : 0, p.isFeatured ? 1 : 0, p.rating || 0, p.reviewCount || 0]
    );
  }
  console.log(`[RAVARI] ✅ Seeded ${PRODUCTS.length} products into MySQL`);
}

const CREATE_COUPONS_SQL = `
  CREATE TABLE IF NOT EXISTS coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(60) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL DEFAULT 'percent',
    value DECIMAL(10,2) NOT NULL,
    minOrder DECIMAL(10,2) DEFAULT 0,
    expiresAt DATE NULL,
    active TINYINT(1) DEFAULT 1,
    usedCount INT DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

const CREATE_ORDERS_SQL = `
  CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customerName VARCHAR(255),
    customerEmail VARCHAR(255),
    customerPhone VARCHAR(60),
    address TEXT,
    items TEXT,
    subtotal DECIMAL(10,2) DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) DEFAULT 0,
    couponCode VARCHAR(60),
    status VARCHAR(40) DEFAULT 'pending',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

async function setupSchemaAndSeed() {
  await query(CREATE_TABLE_SQL);
  await query(CREATE_COUPONS_SQL);
  await query(CREATE_ORDERS_SQL);
  // Seed a couple of sample coupons if none exist
  try {
    const cc = await query('SELECT COUNT(*) AS c FROM coupons');
    if (cc[0].c === 0) {
      await query("INSERT INTO coupons (code,type,value,minOrder,active) VALUES ('WELCOME10','percent',10,0,1),('FLAT500','flat',500,2000,1)");
      console.log('[RAVARI] ✅ Seeded sample coupons');
    }
  } catch (e) { console.error('[RAVARI] coupon seed:', e.message); }
  // Always sync MySQL with the PRODUCTS array (truncate + re-seed)
  await query('TRUNCATE TABLE products');
  await seedRows();
  console.log(`[RAVARI] ✅ Synced ${PRODUCTS.length} products to MySQL`);
}

function shapeRow(r) {
  let images = [];
  try { images = r.images ? JSON.parse(r.images) : []; } catch (_) { images = []; }
  if (!Array.isArray(images) || images.length === 0) images = [{ url: r.thumbnail, alt: r.name }];
  // Always use PRODUCTS array as source of truth for images/thumbnail/variants
  const source = PRODUCTS.find(p => p.id === r.id);
  return {
    id: r.id, _id: String(r.id), name: r.name, slug: r.slug, description: r.description,
    price: Number(r.price), salePrice: r.salePrice != null ? Number(r.salePrice) : null,
    stock: r.stock, category: r.category,
    thumbnail: source?.thumbnail || r.thumbnail,
    images: source?.images || images,
    isNew: !!r.isNew, isFeatured: !!r.isFeatured,
    rating: r.rating != null ? Number(r.rating) : 0, reviewCount: r.reviewCount || 0,
    variants: source?.variants || null,
    variantLabel: source?.variantLabel || null,
    material: source?.material || null,
    dimensions: source?.dimensions || null,
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
        pool = makePool(host);
        await query('SELECT 1');
        await setupSchemaAndSeed();
        dbReady = true; dbError = null; dbHostUsed = host;
        console.log(`[RAVARI] ✅ Database connected via ${host}`);
        return;
      } catch (err) {
        errors.push(`${host}:${err.code || ''} ${err.message}`);
        try { if (pool) pool.end(() => {}); } catch (_) {}
        pool = null;
      }
    }
    dbError = errors.slice(-3).join(' | ');
    await sleep(2000);
  }
  console.error('[RAVARI] ⚠️  DB unavailable, using in-code catalog');
}

// ---------------------------------------------------------------------------
// Static assets: React build, product images, and product videos
// ---------------------------------------------------------------------------
const buildPath = path.join(__dirname, '../frontend/build');
if (fs.existsSync(path.join(buildPath, 'index.html'))) {
  fastify.register(require('@fastify/static'), {
    root: buildPath,
    prefix: '/',
    setHeaders: (res, filePath) => {
      // Never cache HTML (so the browser always loads the current JS bundle);
      // hashed JS/CSS/asset files are immutable and can be cached long-term.
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      } else if (/\.(js|css|png|jpe?g|gif|svg|webp|woff2?)$/i.test(filePath)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    }
  });
  console.log(`[RAVARI] Serving React frontend from ${buildPath}`);
} else {
  console.log(`[RAVARI] ⚠️  React build not found at ${buildPath}`);
}

// Videos (and any extra images) served from backend/public
const backendPublic = path.join(__dirname, 'public');
if (fs.existsSync(backendPublic)) {
  fastify.register(require('@fastify/static'), { root: backendPublic, prefix: '/assets/', decorateReply: false });
  // Direct /videos and /images passthrough to backend/public
  fastify.register(require('@fastify/static'), { root: path.join(backendPublic, 'videos'), prefix: '/videos/', decorateReply: false });
  fastify.register(require('@fastify/static'), { root: uploadsDir, prefix: '/uploads/', decorateReply: false });
  console.log(`[RAVARI] Serving videos + uploads from ${backendPublic}`);
}

// ---------------------------------------------------------------------------
// API routes
// ---------------------------------------------------------------------------
fastify.get('/api/health', async () => ({
  status: 'ok', app: 'Ravari Store',
  database: dbReady ? 'connected' : 'fallback', dbHost: dbHostUsed, dbError,
  products: (await getAllProducts()).length, time: new Date().toISOString()
}));

// List with filters + pagination -> { products, pagination }
fastify.get('/api/products', async (request) => {
  let all = await getAllProducts();
  const q = request.query || {};
  if (q.search) {
    const s = String(q.search).toLowerCase();
    all = all.filter(p => p.name.toLowerCase().includes(s) || (p.description || '').toLowerCase().includes(s));
  }
  if (q.category) all = all.filter(p => p.category === q.category);
  if (q.minPrice) all = all.filter(p => (p.salePrice || p.price) >= Number(q.minPrice));
  if (q.maxPrice) all = all.filter(p => (p.salePrice || p.price) <= Number(q.maxPrice));
  if (q.sort === 'price-low') all.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
  else if (q.sort === 'price-high') all.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
  else if (q.sort === 'newest') all.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));

  const total = all.length;
  const limit = q.limit ? parseInt(q.limit, 10) : 12;
  const page = q.page ? parseInt(q.page, 10) : 1;
  const pages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const items = all.slice(start, start + limit);
  return { products: items, pagination: { page, pages, total, limit } };
});

fastify.get('/api/products/featured', async () => {
  const all = await getAllProducts();
  const f = all.filter(p => p.isFeatured);
  return { products: f.length ? f : all };
});

fastify.get('/api/products/new', async () => {
  const all = await getAllProducts();
  const n = all.filter(p => p.isNew);
  return { products: n.length ? n : all.slice(0, 4) };
});

fastify.get('/api/products/categories/list', async () => {
  const all = await getAllProducts();
  const categories = [...new Set(all.map(p => p.category).filter(Boolean))];
  return { categories };
});

fastify.get('/api/products/slug/:slug', async (request, reply) => {
  const all = await getAllProducts();
  const product = all.find(p => p.slug === request.params.slug);
  if (!product) { reply.code(404); return { error: 'Product not found' }; }
  return { product, reviews: REVIEWS[product.id] || [] };
});

fastify.get('/api/products/:id', async (request, reply) => {
  const id = parseInt(request.params.id, 10);
  const all = await getAllProducts();
  const product = all.find(p => p.id === id);
  if (!product) { reply.code(404); return { error: 'Product not found' }; }
  return { product };
});

// Reviews
fastify.get('/api/reviews', async () => ({ reviews: [] }));
fastify.post('/api/reviews', async (request) => {
  const { productId, rating, comment, name } = request.body || {};
  const pid = parseInt(productId, 10);
  if (!REVIEWS[pid]) REVIEWS[pid] = [];
  const review = { id: REVIEWS[pid].length + 1, name: name || 'Customer', rating: rating || 5, comment: comment || '', createdAt: new Date().toISOString() };
  REVIEWS[pid].push(review);
  return { success: true, review };
});

// --- Admin (light auth: requires Authorization header) ---
function isAuthed(request) {
  const h = request.headers && request.headers.authorization;
  return !!h; // client logs in then sends a bearer token
}

fastify.post('/api/auth/login', async (request, reply) => {
  const { email, password } = request.body || {};
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@ravari.in';
  const adminPass = process.env.ADMIN_PASSWORD || 'ravari@2027';
  if (email === adminEmail && password === adminPass) {
    return { success: true, token: 'admin-token-12345', user: { email, role: 'admin' } };
  }
  reply.code(401); return { success: false, error: 'Invalid credentials' };
});

fastify.post('/api/admin/products', async (request, reply) => {
  if (!isAuthed(request)) { reply.code(401); return { error: 'Unauthorized' }; }
  const b = request.body || {};
  const all = await getAllProducts();
  const newId = Math.max(0, ...all.map(p => p.id)) + 1;
  const images = b.images || (b.thumbnail ? [{ url: b.thumbnail, alt: b.name }] : []);
  if (dbReady && pool) {
    try {
      await query('INSERT INTO products (id, name, slug, description, price, salePrice, stock, category, thumbnail, images, isNew, isFeatured, rating, reviewCount) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [newId, b.name, b.slug || String(b.name||'').toLowerCase().replace(/[^a-z0-9]+/g,'-'), b.description, b.price, b.salePrice || null, b.stock || 0, b.category, b.thumbnail, JSON.stringify(images), b.isNew ? 1 : 0, b.isFeatured ? 1 : 0, 0, 0]);
    } catch (e) { reply.code(500); return { error: e.message }; }
  }
  return { success: true, product: { id: newId, _id: String(newId), ...b, images } };
});

fastify.put('/api/admin/products/:id', async (request, reply) => {
  if (!isAuthed(request)) { reply.code(401); return { error: 'Unauthorized' }; }
  const id = parseInt(request.params.id, 10);
  const b = request.body || {};
  if (dbReady && pool) {
    try {
      await query('UPDATE products SET name=?, description=?, price=?, salePrice=?, stock=?, category=?, thumbnail=?, isNew=?, isFeatured=?, updatedAt=NOW() WHERE id=?',
        [b.name, b.description, b.price, b.salePrice || null, b.stock || 0, b.category, b.thumbnail, b.isNew ? 1 : 0, b.isFeatured ? 1 : 0, id]);
    } catch (e) { reply.code(500); return { error: e.message }; }
  }
  return { success: true };
});

fastify.delete('/api/admin/products/:id', async (request, reply) => {
  if (!isAuthed(request)) { reply.code(401); return { error: 'Unauthorized' }; }
  const id = parseInt(request.params.id, 10);
  if (dbReady && pool) {
    try { await query('DELETE FROM products WHERE id=?', [id]); }
    catch (e) { reply.code(500); return { error: e.message }; }
  }
  return { success: true };
});

// --- Image upload (admin) ---
fastify.post('/api/admin/upload', async (request, reply) => {
  if (!isAuthed(request)) { reply.code(401); return { error: 'Unauthorized' }; }
  try {
    const data = await request.file();
    if (!data) { reply.code(400); return { error: 'No file' }; }
    const orig = (data.filename || 'upload.png').toLowerCase().replace(/[^a-z0-9._-]/g, '_');
    const ext = orig.includes('.') ? orig.split('.').pop() : 'png';
    const base = orig.replace(/\.[^.]*$/, '').slice(0, 40) || 'image';
    const fname = `up_${Date.now()}_${base}.${ext}`;
    const buf = await data.toBuffer();
    fs.writeFileSync(path.join(uploadsDir, fname), buf);
    return { success: true, url: `/uploads/${fname}` };
  } catch (e) {
    request.log.error(e);
    reply.code(500); return { error: e.message };
  }
});

// --- Coupons ---
fastify.get('/api/coupons', async () => {
  if (dbReady && pool) {
    try { const rows = await query('SELECT * FROM coupons ORDER BY id DESC'); return { coupons: rows }; }
    catch (e) { return { coupons: [] }; }
  }
  return { coupons: [] };
});

// Public: validate a coupon code against a cart subtotal
fastify.post('/api/coupons/validate', async (request, reply) => {
  const { code, subtotal } = request.body || {};
  if (!dbReady || !pool) { reply.code(503); return { valid: false, error: 'Coupons unavailable' }; }
  try {
    const rows = await query('SELECT * FROM coupons WHERE code=? AND active=1', [String(code || '').toUpperCase()]);
    if (!rows.length) { return { valid: false, error: 'Invalid code' }; }
    const c = rows[0];
    if (c.expiresAt && new Date(c.expiresAt) < new Date()) return { valid: false, error: 'Coupon expired' };
    const sub = Number(subtotal || 0);
    if (sub < Number(c.minOrder || 0)) return { valid: false, error: `Minimum order ₹${c.minOrder}` };
    const discount = c.type === 'flat' ? Number(c.value) : Math.round(sub * Number(c.value) / 100);
    return { valid: true, code: c.code, type: c.type, value: Number(c.value), discount, minOrder: Number(c.minOrder || 0) };
  } catch (e) { reply.code(500); return { valid: false, error: e.message }; }
});

fastify.post('/api/admin/coupons', async (request, reply) => {
  if (!isAuthed(request)) { reply.code(401); return { error: 'Unauthorized' }; }
  const b = request.body || {};
  if (!dbReady || !pool) { reply.code(503); return { error: 'DB unavailable' }; }
  try {
    await query('INSERT INTO coupons (code,type,value,minOrder,expiresAt,active) VALUES (?,?,?,?,?,?)',
      [String(b.code || '').toUpperCase(), b.type || 'percent', b.value || 0, b.minOrder || 0, b.expiresAt || null, b.active === false ? 0 : 1]);
    return { success: true };
  } catch (e) { reply.code(500); return { error: e.message }; }
});

fastify.put('/api/admin/coupons/:id', async (request, reply) => {
  if (!isAuthed(request)) { reply.code(401); return { error: 'Unauthorized' }; }
  const b = request.body || {};
  if (!dbReady || !pool) { reply.code(503); return { error: 'DB unavailable' }; }
  try {
    await query('UPDATE coupons SET type=?, value=?, minOrder=?, expiresAt=?, active=? WHERE id=?',
      [b.type || 'percent', b.value || 0, b.minOrder || 0, b.expiresAt || null, b.active ? 1 : 0, parseInt(request.params.id, 10)]);
    return { success: true };
  } catch (e) { reply.code(500); return { error: e.message }; }
});

fastify.delete('/api/admin/coupons/:id', async (request, reply) => {
  if (!isAuthed(request)) { reply.code(401); return { error: 'Unauthorized' }; }
  if (!dbReady || !pool) { reply.code(503); return { error: 'DB unavailable' }; }
  try { await query('DELETE FROM coupons WHERE id=?', [parseInt(request.params.id, 10)]); return { success: true }; }
  catch (e) { reply.code(500); return { error: e.message }; }
});

// --- Orders ---
fastify.get('/api/admin/orders', async (request, reply) => {
  if (!isAuthed(request)) { reply.code(401); return { error: 'Unauthorized' }; }
  if (!dbReady || !pool) return { orders: [] };
  try {
    const rows = await query('SELECT * FROM orders ORDER BY id DESC LIMIT 200');
    return { orders: rows.map(o => ({ ...o, items: (() => { try { return JSON.parse(o.items || '[]'); } catch (_) { return []; } })() })) };
  } catch (e) { return { orders: [] }; }
});

// Public: place an order (checkout)
fastify.post('/api/orders', async (request, reply) => {
  const b = request.body || {};
  if (dbReady && pool) {
    try {
      const r = await query('INSERT INTO orders (customerName,customerEmail,customerPhone,address,items,subtotal,discount,total,couponCode,status) VALUES (?,?,?,?,?,?,?,?,?,?)',
        [b.customerName, b.customerEmail, b.customerPhone, b.address, JSON.stringify(b.items || []), b.subtotal || 0, b.discount || 0, b.total || 0, b.couponCode || null, 'pending']);
      return { success: true, orderId: r.insertId };
    } catch (e) { reply.code(500); return { error: e.message }; }
  }
  return { success: true, orderId: null };
});

fastify.put('/api/admin/orders/:id/status', async (request, reply) => {
  if (!isAuthed(request)) { reply.code(401); return { error: 'Unauthorized' }; }
  if (!dbReady || !pool) { reply.code(503); return { error: 'DB unavailable' }; }
  try { await query('UPDATE orders SET status=? WHERE id=?', [(request.body || {}).status || 'pending', parseInt(request.params.id, 10)]); return { success: true }; }
  catch (e) { reply.code(500); return { error: e.message }; }
});

// ---------------------------------------------------------------------------
// Payment — Razorpay + COD
// ---------------------------------------------------------------------------
const RAZORPAY_KEY_ID     = process.env.RAZORPAY_KEY_ID     || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

// Create Razorpay order
fastify.post('/api/payment/razorpay/create', async (request, reply) => {
  try {
    const { amount, currency = 'INR', receipt } = request.body || {};
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      reply.code(503); return { error: 'Razorpay not configured' };
    }
    const Razorpay = require('razorpay');
    const rzp = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
    const order = await rzp.orders.create({ amount: Math.round(amount * 100), currency, receipt: receipt || `rcpt_${Date.now()}` });
    return { success: true, order, key: RAZORPAY_KEY_ID };
  } catch (e) { reply.code(500); return { error: e.message }; }
});

// Verify Razorpay payment signature
fastify.post('/api/payment/razorpay/verify', async (request, reply) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = request.body || {};
    const crypto = require('crypto');
    const expected = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
    if (expected !== razorpay_signature) { reply.code(400); return { success: false, error: 'Invalid signature' }; }
    return { success: true, paymentId: razorpay_payment_id };
  } catch (e) { reply.code(500); return { error: e.message }; }
});

// Public Razorpay key (for frontend)
fastify.get('/api/payment/razorpay/key', async () => ({ key: RAZORPAY_KEY_ID }));

// COD order
fastify.post('/api/orders/cod', async (request, reply) => {
  const b = request.body || {};
  if (dbReady && pool) {
    try {
      const r = await query(
        'INSERT INTO orders (customerName,customerEmail,customerPhone,address,items,subtotal,discount,total,couponCode,status) VALUES (?,?,?,?,?,?,?,?,?,?)',
        [b.customerName, b.customerEmail, b.customerPhone, b.address,
         JSON.stringify(b.items || []), b.subtotal || 0, b.discount || 0, b.total || 0,
         b.couponCode || null, 'cod_pending']);
      return { success: true, orderId: `RAV${r.insertId}`, method: 'cod' };
    } catch (e) { reply.code(500); return { error: e.message }; }
  }
  return { success: true, orderId: `RAV${Date.now()}`, method: 'cod' };
});

// Kill-switch service worker: neutralizes any stale SW from the old site
// (the previous website-builder site registered an SW that kept serving its
//  cached pages offline-first). This unregisters it and clears all caches.
const KILL_SW = "self.addEventListener('install',function(){self.skipWaiting();});" +
  "self.addEventListener('activate',function(e){e.waitUntil((async function(){" +
  "try{var ks=await caches.keys();await Promise.all(ks.map(function(k){return caches.delete(k);}));}catch(_){}" +
  "try{await self.registration.unregister();}catch(_){}" +
  "try{var cs=await self.clients.matchAll();cs.forEach(function(c){c.navigate(c.url);});}catch(_){}" +
  "})());});";
function sendKillSw(request, reply) {
  reply.type('application/javascript').header('Cache-Control', 'no-cache, no-store, must-revalidate').send(KILL_SW);
}
fastify.get('/sw.js', async (req, reply) => sendKillSw(req, reply));
fastify.get('/service-worker.js', async (req, reply) => sendKillSw(req, reply));
fastify.get('/serviceworker.js', async (req, reply) => sendKillSw(req, reply));

// SPA fallback
fastify.setNotFoundHandler((request, reply) => {
  const indexPath = path.join(buildPath, 'index.html');
  if (fs.existsSync(indexPath)) reply.type('text/html').header('Cache-Control', 'no-cache').send(fs.readFileSync(indexPath));
  else reply.code(404).send({ error: 'Not found' });
});

// Start: listen first, then DB
fastify.listen({ port: PORT, host: HOST })
  .then(() => { console.log(`[RAVARI] ✅ Listening on ${HOST}:${PORT}`); initDatabase(); })
  .catch((err) => { fastify.log.error(err); process.exit(1); });

process.on('SIGTERM', () => fastify.close().then(() => process.exit(0)));
process.on('SIGINT', () => fastify.close().then(() => process.exit(0)));
