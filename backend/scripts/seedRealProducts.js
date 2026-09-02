const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
dotenv.config();

const newProduct = {
  name: "RAVARI Women's Premium Leather Handbag",
  slug: 'ravari-womens-premium-leather-handbag',
  description: 'Elegant handcrafted leather handbag for everyday elegance. Spacious interior with premium finish.',
  longDescription: "The RAVARI Women's Premium Leather Handbag is a statement piece crafted for those who value timeless elegance paired with everyday functionality. Made from rich, premium leather with meticulous hand-stitched detailing, this handbag offers a perfect balance of style and practicality. Its spacious interior comfortably fits your essentials — phone, wallet, makeup, and more — while multiple compartments keep everything organized. The sturdy handles and adjustable strap make it versatile for both hand-carry and shoulder wear, transitioning effortlessly from daytime errands to evening occasions. A true wardrobe staple that reflects sophistication in every detail.",
  category: 'Handbags',
  price: 2499,
  salePrice: 1499,
  material: ['Premium Leather'],
  color: ['Brown'],
  size: ['Standard'],
  stock: 15,
  images: [
    { url: "/images/RAVARI Women's Premium Leather Handbag7.png", alt: 'Lifestyle' }
    { url: "/images/RAVARI Women's Premium Leather Handbag.png", alt: 'Front View' },
    { url: "/images/RAVARI Women's Premium Leather Handbag2.png", alt: 'Side View' },
    { url: "/images/RAVARI Women's Premium Leather Handbag3.png", alt: 'Interior View' },
    { url: "/images/RAVARI Women's Premium Leather Handbag5.png", alt: 'Handle & Strap' },
    { url: "/images/RAVARI Women's Premium Leather Handbag6.png", alt: 'Full View' },
    
  ],
  thumbnail: "/images/RAVARI Women's Premium Leather Handbag.png",
  isFeatured: true,
  isNew: true,
  careInstructions: 'Wipe with soft cloth. Avoid direct sunlight and moisture. Store in dust bag when not in use.'
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
