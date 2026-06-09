import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import ProductCard from '../components/ProductCard';
import { useDispatch } from 'react-redux';
import { FiAward, FiTruck, FiRefreshCw, FiShield } from 'react-icons/fi';
import SEO from '../components/SEO';
import { SEO_CONFIG } from '../utils/seoConstants';
import { getOrganizationSchema } from '../utils/schemaMarkup';
import { trackPageView } from '../utils/ga4Tracking';

const VALUES = [
  { icon: <FiAward size={22} />, title: 'Artisan Craftsmanship', desc: 'Every piece is hand-stitched by skilled artisans with decades of leather-working heritage.' },
  { icon: <FiShield size={22} />, title: 'Premium Materials', desc: 'We source only the finest full-grain leather, chosen for texture, durability, and natural beauty.' },
  { icon: <FiRefreshCw size={22} />, title: 'Timeless Design', desc: 'Our silhouettes transcend seasons — crafted to be carried today, treasured for decades.' },
  { icon: <FiTruck size={22} />, title: 'Delivered with Care', desc: 'Each order is inspected, wrapped, and dispatched to arrive as a luxury gift — for yourself.' },
];

const TESTIMONIALS = [
  { name: 'Priya S.', location: 'Mumbai', rating: 5, text: 'The leather quality is exceptional. My Ravari tote has become my everyday essential — I get compliments everywhere I go.' },
  { name: 'Arjun M.', location: 'Delhi', rating: 5, text: 'Gifted my wife the watch case for our anniversary. The packaging, the weight, the craftsmanship — it felt truly premium.' },
  { name: 'Sneha K.', location: 'Bangalore', rating: 5, text: 'RAVARI understands what luxury means. Nothing overdone, everything purposeful. The wallet I ordered is absolutely beautiful.' },
];

function Stars({ count = 5 }) {
  return (
    <div className="flex gap-0.5 mb-3">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-3.5 h-3.5 fill-current" style={{ color: 'var(--gold)' }} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    trackPageView('/', 'Home - RAVARI');
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const [featuredRes, newRes] = await Promise.all([
        api.get('/products/featured'),
        api.get('/products/new'),
      ]);
      setFeaturedProducts(featuredRes.data.products || featuredRes.data || []);
      setNewArrivals(newRes.data.products || newRes.data || []);
    } catch {
      setFeaturedProducts([]);
      setNewArrivals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    dispatch({ type: 'ADD_TO_CART', payload: { productId: product._id, name: product.name, price: product.salePrice || product.price, image: product.thumbnail, quantity: 1, selectedOptions: {} } });
  };

  const handleToggleWishlist = (productId) => console.log('Toggle wishlist:', productId);

  const ProductSkeleton = () => (
    <div className="w-full sm:w-72">
      <div className="skeleton w-full h-80 mb-3" />
      <div className="skeleton h-4 w-3/4 mb-2" />
      <div className="skeleton h-4 w-1/2" />
    </div>
  );

  return (
    <div style={{ backgroundColor: 'var(--white)' }}>
      <SEO title={SEO_CONFIG.pages.home.title} description={SEO_CONFIG.pages.home.description} keywords={SEO_CONFIG.pages.home.keywords} canonical={SEO_CONFIG.site.url} schemaMarkup={getOrganizationSchema()} />

      {/* HERO */}
      <section className="relative flex items-center justify-center overflow-hidden" style={{ minHeight: '92vh', background: 'linear-gradient(135deg, var(--ivory) 0%, var(--beige) 50%, #ddd0ba 100%)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(212,175,55,0.08) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(44,44,44,0.04) 0%, transparent 60%)' }} />
        <div className="container relative z-10 text-center">
          <p className="eyebrow mb-6 fade-in">Luxury Handcrafted Leather Goods — India</p>
          <h1 className="heading-xl mb-6 fade-up" style={{ color: 'var(--charcoal)', maxWidth: '820px', margin: '0 auto 1.5rem' }}>
            Where Heritage Meets<br />
            <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Modern Elegance</em>
          </h1>
          <div className="gold-divider" style={{ marginBottom: '1.5rem' }} />
          <p className="fade-in" style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem', fontWeight: 400, letterSpacing: '0.06em', color: 'var(--text-mid)', marginBottom: '3rem', maxWidth: '420px', margin: '0 auto 3rem' }}>
            Purposefully Crafted. Redefine with Every Detail.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/products" className="btn-primary">Explore Collection</Link>
            <Link to="/about" className="btn-outline">Our Story</Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none" style={{ background: 'linear-gradient(to bottom, transparent, var(--white))' }} />
      </section>

      {/* BRAND VALUES */}
      <section className="section-sm" style={{ backgroundColor: 'var(--white)' }}>
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {VALUES.map((v, i) => (
              <div key={i} className="text-center px-4 py-6 luxury-card">
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-full mb-4" style={{ backgroundColor: 'var(--beige)', color: 'var(--gold-dark)' }}>{v.icon}</div>
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', fontWeight: 500, color: 'var(--charcoal)', marginBottom: '0.5rem' }}>{v.title}</h4>
                <p style={{ fontSize: '0.8rem', lineHeight: '1.6', color: 'var(--text-light)' }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="section" style={{ backgroundColor: 'var(--ivory)' }}>
        <div className="container">
          <div className="text-center mb-14">
            <p className="eyebrow mb-3">Handpicked for You</p>
            <h2 className="heading-lg" style={{ color: 'var(--charcoal)' }}>Featured Collection</h2>
            <div className="gold-divider" />
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--text-mid)', maxWidth: '480px', margin: '0 auto' }}>Our most coveted pieces — each a testament to meticulous artisanship.</p>
          </div>
          {loading ? (
            <div className="flex flex-wrap justify-center gap-8">{[...Array(4)].map((_, i) => <ProductSkeleton key={i} />)}</div>
          ) : featuredProducts.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-8">
              {featuredProducts.map((product) => (
                <div key={product._id} className="w-full sm:w-72 max-w-xs">
                  <ProductCard product={product} onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} isInWishlist={false} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center" style={{ color: 'var(--text-light)', fontFamily: 'var(--font-sans)' }}>Collection coming soon.</p>
          )}
          <div className="text-center mt-12"><Link to="/products" className="btn-outline">View All Products</Link></div>
        </div>
      </section>

      {/* BRAND STORY */}
      <section className="section" style={{ backgroundColor: 'var(--white)' }}>
        <div className="container">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative overflow-hidden" style={{ borderRadius: '2px' }}>
              <video className="w-full h-full object-cover" style={{ maxHeight: '560px', minHeight: '340px' }} autoPlay muted loop playsInline>
                <source src="/videos/Ravari%20Product%20Video%20-%2001.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 pointer-events-none" style={{ border: '2px solid var(--gold)', opacity: 0.25 }} />
            </div>
            <div>
              <p className="eyebrow mb-4">Our Story</p>
              <h2 className="heading-lg mb-6" style={{ color: 'var(--charcoal)' }}>Craftsmanship &<br /><em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Purpose</em></h2>
              <div className="gold-divider-left" style={{ marginBottom: '1.5rem' }} />
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.92rem', color: 'var(--text-mid)', marginBottom: '1.2rem', lineHeight: '1.9' }}>
                RAVARI is built on the belief that craftsmanship and purpose go hand in hand. Each product is passionately crafted to blend timeless design with modern functionality, redefining elegance in everyday essentials.
              </p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.92rem', color: 'var(--text-mid)', marginBottom: '2.5rem', lineHeight: '1.9' }}>
                Our story is about creating pieces that don't just serve a purpose — they tell a tale of heritage, detail, and artistry.
              </p>
              <Link to="/about" className="btn-primary">Discover Our Heritage</Link>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCT VIDEOS */}
      <section className="section-sm" style={{ backgroundColor: 'var(--ivory)' }}>
        <div className="container">
          <div className="text-center mb-12">
            <p className="eyebrow mb-3">See It in Motion</p>
            <h2 className="heading-md" style={{ color: 'var(--charcoal)' }}>The Art of Leather</h2>
            <div className="gold-divider" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['01','02','03','04'].map((num, idx) => (
              <div key={idx} className="relative overflow-hidden group" style={{ borderRadius: '2px', aspectRatio: '9/16' }}>
                <video className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loop muted playsInline preload="auto"
                  onMouseEnter={(e) => { e.currentTarget.muted = false; e.currentTarget.play().catch(() => {}); }}
                  onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.muted = true; try { e.currentTarget.currentTime = 0; } catch (_) {} }}>
                  <source src={`/videos/Ravari%20Product%20Video%20-%20${num}.mp4#t=0.1`} type="video/mp4" />
                </video>
                <div className="absolute inset-0 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to top, rgba(44,44,44,0.7) 0%, transparent 60%)' }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.7rem', letterSpacing: '0.15em', color: 'var(--gold)', textTransform: 'uppercase' }}>Hover for sound</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="section" style={{ backgroundColor: 'var(--white)' }}>
        <div className="container">
          <div className="text-center mb-14">
            <p className="eyebrow mb-3">Just Arrived</p>
            <h2 className="heading-lg" style={{ color: 'var(--charcoal)' }}>New Arrivals</h2>
            <div className="gold-divider" />
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--text-mid)', maxWidth: '480px', margin: '0 auto' }}>The newest additions to our exclusive leather collection.</p>
          </div>
          {loading ? (
            <div className="flex flex-wrap justify-center gap-8">{[...Array(4)].map((_, i) => <ProductSkeleton key={i} />)}</div>
          ) : newArrivals.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-8">
              {newArrivals.map((product) => (
                <div key={product._id} className="w-full sm:w-72 max-w-xs">
                  <ProductCard product={product} onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} isInWishlist={false} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center" style={{ color: 'var(--text-light)', fontFamily: 'var(--font-sans)' }}>New arrivals coming soon.</p>
          )}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section" style={{ backgroundColor: 'var(--charcoal)' }}>
        <div className="container">
          <div className="text-center mb-14">
            <p className="eyebrow mb-3" style={{ color: 'var(--gold)' }}>What Our Customers Say</p>
            <h2 className="heading-lg" style={{ color: 'var(--ivory)' }}>Loved by Many</h2>
            <div className="gold-divider" />
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="p-8" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '2px' }}>
                <Stars count={t.rating} />
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', fontStyle: 'italic', color: 'rgba(248,248,244,0.85)', lineHeight: '1.8', marginBottom: '1.5rem' }}>"{t.text}"</p>
                <div style={{ borderTop: '1px solid rgba(212,175,55,0.2)', paddingTop: '1rem' }}>
                  <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '0.8rem', color: 'var(--gold)', letterSpacing: '0.08em' }}>{t.name}</p>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{t.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MARKETPLACES */}
      <section className="section" style={{ backgroundColor: 'var(--beige)' }}>
        <div className="container text-center">
          <p className="eyebrow mb-4">Find RAVARI On</p>
          <h2 className="heading-md mb-4" style={{ color: 'var(--charcoal)' }}>Shop Wherever You Are</h2>
          <div className="gold-divider" />
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--text-mid)', marginBottom: '3rem', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>RAVARI is available on your favourite platforms. Choose where you'd like to shop.</p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <Link to="/products" className="btn-primary">Shop on ravari.in</Link>
            <a href="https://www.amazon.in/s?k=ravari" target="_blank" rel="noopener noreferrer" className="btn-outline">Shop on Amazon</a>
            <a href="https://www.meesho.com/ravari" target="_blank" rel="noopener noreferrer" className="btn-outline">Shop on Meesho</a>
          </div>
        </div>
      </section>

      {/* INSTAGRAM */}
      <section className="section-sm" style={{ backgroundColor: 'var(--white)' }}>
        <div className="container text-center">
          <p className="eyebrow mb-3">Follow the Journey</p>
          <h2 className="heading-md mb-2" style={{ color: 'var(--charcoal)' }}>@ravari_store</h2>
          <div className="gold-divider" />
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.88rem', color: 'var(--text-light)', marginBottom: '2rem' }}>Follow us on Instagram for behind-the-scenes craft stories, new arrivals, and styling inspiration.</p>
          <a href="https://www.instagram.com/ravari_store" target="_blank" rel="noopener noreferrer" className="btn-gold">Follow on Instagram</a>
        </div>
      </section>
    </div>
  );
}

export default Home;
