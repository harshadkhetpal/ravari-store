const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
dotenv.config();

const newProduct = {
  name: "RAVARI Women's Premium Leather Handbag",
  slug: 'ravari-womens-premium-leather-handbag',
  description: 'Elegant handcrafted leather handbag for everyday elegance. Spacious interior with premium finish.',
  longDescription: "The RAVARI Women's Premium Leather Handbag is a statement piece crafted for those who value timeless elegance paired with everyday...",
  category: 'Handbags',
  price: 2499,
  salePrice: 1499,
  material: ['Premium Leather'],
  color: ['Brown'],
  size: ['Standard'],
  stock: 15,
  images: [
    { url: "/images/RAVARI Women's Premium Leather Handbag6.png", alt: 'Full View' },
    { url: "/images/RAVARI Women's Premium Leather Handbag.png", alt: 'Front View' },
    { url: "/images/RAVARI Women's Premium Leather Handbag2.png", alt: 'Side View' },
    { url: "/images/RAVARI Women's Premium Leather Handbag3.png", alt: 'Interior View' },
    { url: "/images/RAVARI Women's Premium Leather Handbag5.png", alt: 'Handle & Strap' },
    { url: "/images/RAVARI Women's Premium Leather Handbag7.png", alt: 'Lifestyle' },
  ],
  thumbnail: "/images/RAVARI Women's Premium Leather Handbag6.png",
