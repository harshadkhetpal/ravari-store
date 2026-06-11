import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import ProductCard from '../components/ProductCard';
import { useDispatch } from 'react-redux';
import { FiArrowRight, FiTruck, FiRefreshCw, FiAward, FiMessageCircle } from 'react-icons/fi';
import SEO from '../components/SEO';
import { SEO_CONFIG } from '../utils/seoConstants';
import { getOrganizationSchema } from '../utils/schemaMarkup';
import { trackPageView } from '../utils/ga4Tracking';

const CATEGORIES = [
  { name: 'Sling Bags',  image: '/images/p1-a.png', to: '/products?category=Sling+Bags' },
  { name: 'Tote Bags',   image: '/images/p3-a.png', to: '/products?category=Tote+Bags' },
  { name: 'Handbags',    image: '/images/p4-a.png', to: '/products?category=Handbags' },
  { name: 'Accessories', image: '/images/p6-a.png', to: '/products?category=Organizers' },
];

const TRUST = [
  { icon: <FiTruck size={18} />,         title: 'Free Shipping',     sub: 'On orders above ₹2,000' },
  { icon: <FiRefreshCw size={18} />,     title: 'Easy Returns',      sub: '7-day hassle-free returns' },
  { icon: <FiAward size={18} />,         title: 'Genuine Leather',   sub: '100% authentic materials' },
  { icon: <FiMessageCircle size={18} />, title: 'Dedicated Support', sub: 'Mon–Sat, 10am–7pm IST' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [newArr,   setNewArr]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    trackPageView('/', 'Home - RAVARI');
    (async () => {
      try {
        const [fRes, nRes] = await Promise.all([
          api.get('/products/featured'),
          api.get('/products/new'),
        ]);
        setFeatured(fRes.data.products || fRes.data || []);
        setNewArr(nRes.data.products   || nRes.data   || []);
      } catch { setFeatured([]); setNewArr([]); }
      finally  { setLoading(false); }
    })();
  }, []);

  const addToCart = p => dispatch({
    type: 'ADD_TO_CART',
    payload: { productId: p._id, name: p.name, price: p.salePrice || p.price, image: p.thumbnail, quantity: 1, selectedOptions: {} },
  });

  return (
    <div style={{ backgroundColor: '#FFFFFF' }}>
      <SEO
        title={SEO_CONFIG.pages.home.title}
        description={SEO_CONFIG.pages.home.description}
        keywords={SEO_CONFIG.pages.home.keywords}
        canonical={SEO_CONFIG.site.url}
        schemaMarkup={getOrganizationSchema()}
      />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{ position: 'relative', height: '92vh', minHeight: '600px', overflow: 'hidden', backgroundColor: '#0D0D0D' }}>
        {/* Background video */}
        <video
          autoPlay muted loop playsInline
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.65 }}
        >
          <source src="/videos/Ravari%20Product%20Video%20-%2001.mp4" type="video/mp4" />
        </video>

        {/* Overlay gradient */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(13,13,13,0.75) 40%, rgba(13,13,13,0.2) 100%)' }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2, height: '100%', maxWidth: '1400px', margin: '0 auto', padding: '0 3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p className="label" style={{ color: '#C9A84C', marginBottom: '1.5rem' }}>New Collection 2025</p>
          <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(3rem, 7vw, 6rem)', fontWeight: 500, color: '#FFFFFF', lineHeight: 1.05, marginBottom: '1.5rem', maxWidth: '600px' }}>
            Purposefully<br />
            <em style={{ fontStyle: 'italic', fontWeight: 300 }}>Crafted.</em>
          </h1>
          <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.9rem', fontWeight: 300, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.05em', lineHeight: 1.8, marginBottom: '2.5rem', maxWidth: '380px' }}>
            Handcrafted leather goods built for life — each piece a testament to artisan skill and enduring quality.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/products" className="btn-outline-white">Shop Collection</Link>
            <Link to="/about" style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A84C', display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '0.9rem', transition: 'gap 0.3s' }}
              onMouseEnter={e => e.currentTarget.style.gap='0.8rem'}
              onMouseLeave={e => e.currentTarget.style.gap='0.5rem'}>
              Our Story <FiArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', zIndex: 2 }}>
          <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.55rem', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Scroll</span>
          <div style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom, rgba(201,168,76,0.8), transparent)' }} />
        </div>
      </section>

      {/* ── TRUST STRIP ──────────────────────────────────── */}
      <section style={{ borderBottom: '1px solid #E0DBD4', borderTop: '1px solid #E0DBD4' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.2rem 2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            {TRUST.map(({ icon, title, sub }) => (
              <div key={title} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
                <span style={{ color: '#C9A84C', flexShrink: 0 }}>{icon}</span>
                <div>
                  <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#0D0D0D' }}>{title}</p>
                  <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', color: '#8C8680', marginTop: '1px' }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SHOP BY CATEGORY ─────────────────────────────── */}
      <section style={{ padding: '6rem 0', backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <p className="label" style={{ marginBottom: '1rem' }}>Explore</p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 500, color: '#0D0D0D' }}>Shop by Category</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            {CATEGORIES.map(cat => (
              <Link key={cat.name} to={cat.to} style={{ display: 'block', textDecoration: 'none' }}>
                <div style={{ overflow: 'hidden', backgroundColor: '#F5F3EE', aspectRatio: '3/4', position: 'relative' }}>
                  <img src={cat.image} alt={cat.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s ease' }}
                    onMouseEnter={e => e.target.style.transform='scale(1.06)'}
                    onMouseLeave={e => e.target.style.transform='scale(1)'}
                  />
                </div>
                <div style={{ paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', fontWeight: 500, color: '#0D0D0D', letterSpacing: '0.02em' }}>{cat.name}</h3>
                  <FiArrowRight size={14} style={{ color: '#C9A84C' }} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ────────────────────────────── */}
      <section style={{ padding: '4rem 0 6rem', backgroundColor: '#F5F3EE' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
            <div>
              <p className="label" style={{ marginBottom: '0.75rem' }}>Handpicked</p>
              <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 500, color: '#0D0D0D' }}>Best Sellers</h2>
            </div>
            <Link to="/products" style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#0D0D0D', display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px solid #C9A84C', paddingBottom: '2px' }}>
              View All <FiArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: '400px' }} />)}
            </div>
          ) : featured.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
              {featured.map(p => <ProductCard key={p._id} product={p} onAddToCart={addToCart} onToggleWishlist={() => {}} isInWishlist={false} />)}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#8C8680', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem' }}>Loading premium collection…</p>
          )}
        </div>
      </section>

      {/* ── BRAND STORY BANNER ───────────────────────────── */}
      <section style={{ backgroundColor: '#0D0D0D', padding: '7rem 2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <p className="label" style={{ marginBottom: '2rem' }}>Est. 2012</p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 400, color: '#FFFFFF', lineHeight: 1.3, marginBottom: '1.5rem' }}>
            "Every stitch is a commitment.<br />
            <em style={{ color: '#C9A84C' }}>Every piece, a lifetime."</em>
          </h2>
          <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.85rem', fontWeight: 300, color: 'rgba(255,255,255,0.6)', lineHeight: 1.9, marginBottom: '2.5rem', maxWidth: '500px', margin: '0 auto 2.5rem' }}>
            Born from a devotion to the craft, RAVARI creates leather goods that outlast trends — made by artisans, made to last.
          </p>
          <Link to="/about" className="btn-outline-white">Discover Our Story</Link>
        </div>
      </section>

      {/* ── NEW ARRIVALS ─────────────────────────────────── */}
      <section style={{ padding: '6rem 0', backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
            <div>
              <p className="label" style={{ marginBottom: '0.75rem' }}>Fresh In</p>
              <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 500, color: '#0D0D0D' }}>New Arrivals</h2>
            </div>
            <Link to="/products" style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#0D0D0D', display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px solid #C9A84C', paddingBottom: '2px' }}>
              View All <FiArrowRight size={12} />
            </Link>
          </div>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: '400px' }} />)}
            </div>
          ) : newArr.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
              {newArr.map(p => <ProductCard key={p._id} product={p} onAddToCart={addToCart} onToggleWishlist={() => {}} isInWishlist={false} />)}
            </div>
          ) : null}
        </div>
      </section>

      {/* ── CRAFT PROCESS ────────────────────────────────── */}
      <section style={{ backgroundColor: '#F5F3EE', padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <p className="label" style={{ marginBottom: '0.75rem' }}>How We Make It</p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 500, color: '#0D0D0D' }}>The Craft Process</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '2rem' }}>
            {[
              { n: '01', title: 'Design',    desc: 'Sketched by hand' },
              { n: '02', title: 'Selection', desc: 'Premium leather sourced' },
              { n: '03', title: 'Cutting',   desc: 'Precision patterns' },
              { n: '04', title: 'Stitching', desc: 'Hand-sewn by artisans' },
              { n: '05', title: 'Finishing', desc: 'Polished & inspected' },
            ].map(({ n, title, desc }) => (
              <div key={n} style={{ textAlign: 'center' }}>
                <div style={{ width: '52px', height: '52px', border: '1px solid #C9A84C', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                  <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.1em', color: '#C9A84C' }}>{n}</span>
                </div>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', fontWeight: 500, color: '#0D0D0D', marginBottom: '0.35rem' }}>{title}</h3>
                <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.7rem', color: '#8C8680', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
