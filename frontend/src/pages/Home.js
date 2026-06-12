import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FiArrowRight } from 'react-icons/fi';
import api from '../api/axiosConfig';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';
import { SEO_CONFIG } from '../utils/seoConstants';
import { getOrganizationSchema } from '../utils/schemaMarkup';
import { trackPageView } from '../utils/ga4Tracking';

/* ── Hero videos ───────────────────────────────────────── */
const HERO_VIDEOS = [
  '/static/videos/Cream%20%26%20Brown%20Product%20Leather%20Instagram%20Post.mp4',
  '/static/videos/Cream%20%26%20Brown%20Product%20Leather%20Instagram%20Post%20(1).mp4',
  '/static/videos/Cream%20%26%20Brown%20Product%20Leather%20Instagram%20Post%20(2).mp4',
];

/* ── Categories ────────────────────────────────────────── */
const CATEGORIES = [
  { name: 'Sling Bags',    to: '/products?category=Sling+Bags',    img: '/static/videos/Copilot_20260416_160042.png' },
  { name: 'Watch Box',     to: '/products?category=Watch+Box',     img: '/static/videos/Untitled%20design%20(51).png' },
  { name: 'Tote Bags',     to: '/products?category=Tote+Bags',     img: '/static/videos/Untitled%20design%20(4).png' },
  { name: 'Jewellery Box', to: '/products?category=Jewellery+Box', img: '/static/videos/Untitled%20design%20(46).png' },
];

/* ── Scrolling marquee bar ─────────────────────────────── */
function MarqueeBar() {
  const words = ['DURABLE', 'TEXTURED', 'FULL GRAIN', 'STITCHED', 'REINFORCED'];
  const repeated = [...words, ...words, ...words, ...words];
  return (
    <div style={{ backgroundColor: '#0D0D0D', overflow: 'hidden', padding: '10px 0' }}>
      <div style={{ display: 'flex', animation: 'marquee 28s linear infinite', width: 'max-content' }}>
        {repeated.map((t, i) => (
          <span key={i} style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.58rem', fontWeight: 500, letterSpacing: '0.32em', color: '#C9A84C', textTransform: 'uppercase', padding: '0 2rem', whiteSpace: 'nowrap' }}>
            {t} <span style={{ opacity: 0.3, marginLeft: '2rem' }}>·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Hero video carousel ───────────────────────────────── */
function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const videoRef = useRef(null);

  const next = () => setCurrent(c => (c + 1) % HERO_VIDEOS.length);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.load();
    v.play().catch(() => {});
  }, [current]);

  return (
    <section style={{ position: 'relative', width: '100%', height: '100vh', minHeight: '580px', backgroundColor: '#111', overflow: 'hidden' }}>
      <video
        ref={videoRef}
        key={current}
        autoPlay muted playsInline
        onEnded={next}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
      >
        <source src={HERO_VIDEOS[current]} type="video/mp4" />
      </video>

      {/* Vignette */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.05) 60%, rgba(0,0,0,0.15) 100%)' }} />

      {/* Text — bottom left */}
      <div style={{ position: 'absolute', bottom: '12%', left: '6%', zIndex: 2 }}>
        <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.58rem', fontWeight: 400, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)', marginBottom: '1.1rem' }}>
          New Collection · 2025
        </p>
        <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(2.8rem, 6vw, 5.5rem)', fontWeight: 400, color: '#FFFFFF', lineHeight: 1.08, marginBottom: '2rem', maxWidth: '540px' }}>
          Crafted for<br />
          <em style={{ fontWeight: 300, fontStyle: 'italic' }}>every journey.</em>
        </h1>
        <Link to="/products"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.7rem', fontFamily: 'Jost, sans-serif', fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#FFFFFF', borderBottom: '1px solid rgba(255,255,255,0.5)', paddingBottom: '4px', transition: 'border-color 0.3s, color 0.3s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#C9A84C'; e.currentTarget.style.color = '#C9A84C'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; e.currentTarget.style.color = '#FFFFFF'; }}>
          Shop Now <FiArrowRight size={13} />
        </Link>
      </div>

      {/* Dots */}
      <div style={{ position: 'absolute', bottom: '5%', right: '5%', display: 'flex', gap: '8px', zIndex: 2 }}>
        {HERO_VIDEOS.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            style={{ width: i === current ? '24px' : '6px', height: '6px', borderRadius: '3px', backgroundColor: i === current ? '#C9A84C' : 'rgba(255,255,255,0.35)', border: 'none', cursor: 'pointer', transition: 'all 0.4s ease', padding: 0 }} />
        ))}
      </div>
    </section>
  );
}

/* ── Main ──────────────────────────────────────────────── */
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

      <MarqueeBar />
      <HeroCarousel />

      {/* ── SHOP BY CATEGORY ─────────────────────────────── */}
      <section style={{ padding: '7rem 0', backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3.5rem' }}>
            <div>
              <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.58rem', fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.6rem' }}>Explore</p>
              <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 400, color: '#0D0D0D' }}>Shop by Category</h2>
            </div>
            <Link to="/products" style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.58rem', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#0D0D0D', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #0D0D0D', paddingBottom: '2px' }}>
              View All <FiArrowRight size={11} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            {CATEGORIES.map(cat => (
              <Link key={cat.name} to={cat.to} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ overflow: 'hidden', backgroundColor: '#F0EDE8', aspectRatio: '3/4', position: 'relative' }}>
                  <img
                    src={cat.img} alt={cat.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.9s cubic-bezier(0.25,0.46,0.45,0.94)' }}
                    onMouseEnter={e => e.target.style.transform = 'scale(1.07)'}
                    onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                  />
                </div>
                <div style={{ paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.05rem', fontWeight: 500, color: '#0D0D0D' }}>{cat.name}</h3>
                  <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.58rem', color: '#8C8680', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Shop →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 2.5rem' }}><div style={{ height: '1px', backgroundColor: '#E8E4DE' }} /></div>

      {/* ── BEST SELLERS ─────────────────────────────────── */}
      <section style={{ padding: '7rem 0', backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3.5rem' }}>
            <div>
              <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.58rem', fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.6rem' }}>Handpicked</p>
              <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 400, color: '#0D0D0D' }}>Best Sellers</h2>
            </div>
            <Link to="/products" style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.58rem', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#0D0D0D', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #0D0D0D', paddingBottom: '2px' }}>
              View All <FiArrowRight size={11} />
            </Link>
          </div>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: '420px' }} />)}
            </div>
          ) : featured.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
              {featured.slice(0, 4).map(p => (
                <ProductCard key={p._id} product={p} onAddToCart={addToCart} onToggleWishlist={() => {}} isInWishlist={false} />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* ── BRAND STORY ──────────────────────────────────── */}
      <section style={{ backgroundColor: '#F5F3EE' }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '500px' }}>
          <div style={{ backgroundColor: '#E8E4DE', overflow: 'hidden' }}>
            <img src="/images/Ravari%20Logo%20Banner.jpeg" alt="RAVARI craftsmanship"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '5rem 4rem' }}>
            <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.58rem', fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '1.25rem' }}>Our Story</p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 400, color: '#0D0D0D', lineHeight: 1.15, marginBottom: '1.75rem' }}>
              Craftsmanship<br />with Purpose
            </h2>
            <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.83rem', fontWeight: 300, color: '#4A4642', lineHeight: 2, marginBottom: '2.5rem' }}>
              Ravari stands for craftsmanship with purpose. Made from durable, textured full-grain leather and finished with reinforced stitching, our products are designed to accompany every journey with confidence, character, and enduring style.
            </p>
            <Link to="/about"
              style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#0D0D0D', display: 'inline-flex', alignItems: 'center', gap: '0.55rem', borderBottom: '1px solid #0D0D0D', paddingBottom: '3px', width: 'fit-content' }}>
              Read More <FiArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── NEW ARRIVALS ─────────────────────────────────── */}
      <section style={{ padding: '7rem 0', backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3.5rem' }}>
            <div>
              <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.58rem', fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.6rem' }}>Fresh In</p>
              <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 400, color: '#0D0D0D' }}>New Arrivals</h2>
            </div>
            <Link to="/products" style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.58rem', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#0D0D0D', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #0D0D0D', paddingBottom: '2px' }}>
              View All <FiArrowRight size={11} />
            </Link>
          </div>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: '420px' }} />)}
            </div>
          ) : newArr.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
              {newArr.slice(0, 4).map(p => (
                <ProductCard key={p._id} product={p} onAddToCart={addToCart} onToggleWishlist={() => {}} isInWishlist={false} />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* ── CRAFT QUALITIES STRIP ────────────────────────── */}
      <section style={{ backgroundColor: '#0D0D0D', padding: '0' }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)' }}>
          {[
            { label: 'Full Grain',  desc: 'Highest quality leather' },
            { label: 'Durable',     desc: 'Built to last decades'   },
            { label: 'Reinforced',  desc: 'Double-stitched seams'   },
            { label: 'Textured',    desc: 'Rich natural grain'       },
            { label: 'Handcrafted', desc: 'Made by skilled artisans' },
          ].map(({ label, desc }, i) => (
            <div key={label} style={{ padding: '2.75rem 1.5rem', textAlign: 'center', borderRight: i < 4 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
              <div style={{ width: '1px', height: '28px', backgroundColor: '#C9A84C', margin: '0 auto 1.25rem' }} />
              <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.05rem', fontWeight: 500, color: '#FFFFFF', marginBottom: '0.35rem' }}>{label}</h4>
              <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.62rem', color: 'rgba(255,255,255,0.38)', letterSpacing: '0.04em' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
