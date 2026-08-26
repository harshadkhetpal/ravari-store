const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');

dotenv.config();

const newProduct = {
  name: 'RAVARI Premium Leather Card Holder for Men & Women',
  slug: 'ravari-premium-leather-card-holder-men-women',
  description: 'Slim wallet with multiple card slots. Compact credit card, debit card & ID holder. Stylish and travel friendly.',
  longDescription: 'RAVARI Premium Leather Card Holder is a sleek and compact everyday essential designed for men and women who prefer to carry only what matters. Crafted with a rich vintage-inspired leather finish and durable hand-stitched detailing, it combines timeless style with practical organization. Its slim profile makes it easy to carry in your pocket, bag, or travel essentials without unnecessary bulk. Designed to hold essential cards, ID, and some cash, this card holder keeps your everyday valuables organized while maintaining a sophisticated, minimalist look. The RFID-protected design adds an extra layer of security for compatible contactless cards.',
  category: 'Wallets',
  price: 1099,
  salePrice: 549,
  material: ['Premium Leather', 'RFID Protected Lining'],
  color: ['Brown'],
  size: ['Standard'],
  stock: 20,
  images: [
    { url: '/images/RAVARI Premium Leather Card Holder for Men & Women -view1.png', alt: 'Front View' },
    { url: '/images/RAVARI Premium Leather Card Holder for Men & Women-view2.png', alt: 'Side View' },
    { url: '/images/RAVARI Premium Leather Card Holder for Men & Women View3 .png', alt: 'Card Slots' },
    { url: '/images/RAVARI Premium Leather Card Holder for Men & Women View 4.png', alt: 'Detail View' },
    { url: '/images/RAVARI Premium Leather Card Holder for Men & Women View 5.png', alt: 'Full View' },
    { url: '/images/RAVARI Premium Leather Card Holder for Men & Women view 6.png', alt: 'Lifestyle' }
  ],
  thumbnail: '/images/RAVARI Premium Leather Card Holder for Men & Women -view1.png',
  isFeatured: true,
  isNew: true,
  careInstructions: 'Wipe with soft cloth. Avoid direct sunlight. Store in dust bag.'
};

const addProduct = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    const existing = await Product.findOne({ slug: newProduct.slug });
    if (existing) {
      console.log('⚠️ A product with this slug already exists. Aborting to avoid duplicates.');
      process.exit(1);
    }

    const product = await Product.create(newProduct);
    console.log(`✅ Added product: ${product.name} (₹${product.price})`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding product:', error);
    process.exit(1);
  }
};

addProduct();
