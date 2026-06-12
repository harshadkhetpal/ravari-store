import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import api from '../api/axiosConfig';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';
import { SEO_CONFIG } from '../utils/seoConstants';
import { getOrganizationSchema } from '../utils/schemaMarkup';
import { trackPageView } from '../utils/ga4Tracking';

/* ── Hero slides ───────────────────────────────────────── */
const SLIDES = [
  { img: '/static/videos/hero1.jpg', to: '/products?category=Jewellery+Box' },
  { img: '/static/videos/hero2.jpg', to: '/products?category=Watch+Box'     },
  { img: '/static/videos/hero3.jpg', to: '/products?category=Tote+Bags'     },
  { img: '/static/videos/hero4.jpg', to: '/products'                        },
  { img: '/static/videos/hero5.jpg', to: '/products'                        },
];

/* ── Categories ────────────────────────────────────────── */
const CATEGORIES = [
  { name: 'Sling Bags',    to: '/products?category=Sling+Bags',    img: '/static/videos/Copilot_20260416_160042.png' },
  { name: 'Watch Box',     to: '/products?category=Watch+Box',     img: '/static/videos/Untitled%20design%20(51).png' },
  { name: 'Tote Bags',     to: '/products?category=Tote+Bags',     img: '/static/videos/Untitled%20design%20(4).png' },
  { name: 'Jewellery Box', to: '/products?category=Jewellery+Box', img: '/static/videos/Untitled%20design%20(46).png' },
];

/* ── Hero image slider (Nappa Dori style) ──────────────── */
function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  const goTo = useCallback(idx => {
    setCurrent((idx + SLIDES.length) % SLIDES.length);
  }, []);

  /* Auto-advance every 5s */
  useEffect(() => {
    timerRef.current = setInterval(() => goTo(current + 1), 5000);
    return () => clearInterval(timerRef.current);
  }, [current, goTo]);

  return (
    <section style={{ position: 'relative', width: '100%', height: '88vh', minHeight: '540px', overflow: 'hidden', backgroundColor: '#1a1008' }}>

      {/* Slides */}
      {SLIDES.map((slide, i) => (
        <div key={i} style={{
          position: 'absolute', inset: 0,
          opacity: i === current ? 1 : 0,
          transition: 'opacity 0.9s ease-in-out',
          zIndex: i === current ? 1 : 0,
        }}>
          <img
            src={slide.img}
            alt={`Slide ${i + 1}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
          />
          {/* subtle bottom gradient for button readability */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 50%)' }} />
        </div>
      ))}

      {/* SHOP NOW button — bottom left */}
      <div style={{ position: 'absolute', bottom: '10%', left: '5%', zIndex: 10 }}>
        <Link
          to={SLIDES[current].to}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.7rem',
            fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', fontWeight: 500,
            letterSpacing: '0.25em', textTransform: 'uppercase',
            color: '#FFFFFF',
            backgroundColor: 'rgba(0,0,0,0.45)',
            border: '1px solid rgba(255,255,255,0.6)',
            padding: '0.8rem 2rem',
            backdropFilter: 'blur(4px)',
            transition: 'background 0.3s, border-color 0.3s',
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#C9A84C'; e.currentTarget.style.borderColor = '#C9A84C'; e.currentTarget.style.color = '#0D0D0D'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.45)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'; e.currentTarget.style.color = '#FFFFFF'; }}>
          SHOP NOW <FiArrowRight size={13} />
        </Link>
      </div>

      {/* Prev / Next arrows */}
      {[
        { dir: -1, side: 'left',  icon: <FiChevronLeft  size={22} /> },
        { dir:  1, side: 'right', icon: <FiChevronRight size={22} /> },
      ].map(({ dir, side, icon }) => (
        <button key={side} onClick={() => goTo(current + dir)}
          style={{
            position: 'absolute', top: '50%', [side]: '1.5rem',
            transform: 'translateY(-50%)',
            zIndex: 10, background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.25)',
            color: '#FFFFFF', width: '42px', height: '42px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'background 0.2s',
            backdropFilter: 'blur(4px)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.7)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}>
          {icon}
        </button>
      ))}

      {/* Dot navigation — bottom center */}
      <div style={{ position: 'absolute', bottom: '4%', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 10 }}>
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => goTo(i)}
            style={{
              width: i === current ? '28px' : '8px', height: '8px',
              borderRadius: '4px',
              backgroundColor: i === current ? '#C9A84C' : 'rgba(255,255,255,0.45)',
              border: 'none', cursor: 'pointer',
              transition: 'all 0.4s ease', padding: 0,
            }} />
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

      <HeroSlider />

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
