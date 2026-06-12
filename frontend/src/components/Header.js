import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiSearch, FiHeart, FiShoppingBag, FiMenu, FiX, FiPhone, FiMail } from 'react-icons/fi';

const NAV = [
  { label: 'About Us',   to: '/about'    },
  { label: 'Shop',       to: '/products' },
  { label: 'Collection', to: '/products' },
  { label: 'Contact',    to: '/contact'  },
];

const TOP_BG = '#0D0B08';
const NAV_BG = '#1A1510';
const GOLD   = '#C9A84C';
const BORDER = 'rgba(201,168,76,0.18)';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location  = useLocation();
  const cartItems = useSelector(s => s.cart?.items || []);
  const cartCount = cartItems.reduce((n, i) => n + (i.quantity || 1), 0);

  useEffect(() => { setMenuOpen(false); }, [location]);

  return (
    <>
      {/* ── ROW 1: contact | RAVARI | icons ─────────────── */}
      <div style={{ backgroundColor: TOP_BG, borderBottom: `1px solid ${BORDER}`, position: 'sticky', top: 0, zIndex: 200 }}>
        <div className="header-top-row" style={{
          maxWidth: '1400px', margin: '0 auto', padding: '0 2rem',
          display: 'grid', gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center', height: '76px',
        }}>

          {/* Left — phone + email */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <a href="tel:+919084260869" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', textDecoration: 'none' }}>
              <FiPhone size={14} style={{ color: GOLD, flexShrink: 0 }} />
              <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.9)', whiteSpace: 'nowrap' }}>
                +91 90842 60869
              </span>
            </a>
            <a href="mailto:ravari.store@gmail.com" className="header-email" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', textDecoration: 'none' }}>
              <FiMail size={14} style={{ color: GOLD, flexShrink: 0 }} />
              <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.04em', color: 'rgba(255,255,255,0.9)', whiteSpace: 'nowrap' }}>
                ravari.store@gmail.com
              </span>
            </a>
          </div>

          {/* Center — RAVARI wordmark */}
          <Link to="/" style={{ textAlign: 'center', textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
            <span className="ravari-wordmark" style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '2.5rem',
              fontWeight: 600,
              letterSpacing: '0.55em',
              color: GOLD,
              lineHeight: 1,
              paddingLeft: '0.55em',
            }}>
              RAVARI
            </span>
            <span className="ravari-tagline" style={{
              fontFamily: 'Jost, sans-serif',
              fontSize: '0.5rem',
              fontWeight: 500,
              letterSpacing: '0.22em',
              color: 'rgba(201,168,76,0.95)',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}>
              DURABLE &nbsp;|&nbsp; TEXTURED &nbsp;|&nbsp; FULL GRAIN &nbsp;|&nbsp; STITCHED &nbsp;|&nbsp; REINFORCED
            </span>
          </Link>

          {/* Right — icons + mobile toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1.4rem' }}>
            <button aria-label="Search" style={{ color: 'rgba(255,255,255,0.85)', display: 'flex', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = GOLD}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}>
              <FiSearch size={18} />
            </button>
            <Link to="/wishlist" aria-label="Wishlist" style={{ color: 'rgba(255,255,255,0.85)', display: 'flex', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = GOLD}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}>
              <FiHeart size={18} />
            </Link>
            <Link to="/cart" aria-label="Cart" style={{ color: 'rgba(255,255,255,0.85)', display: 'flex', position: 'relative', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = GOLD}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}>
              <FiShoppingBag size={18} />
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: '-6px', right: '-7px', backgroundColor: GOLD, color: '#0D0D0D', fontSize: '0.48rem', fontWeight: 700, width: '15px', height: '15px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {cartCount}
                </span>
              )}
            </Link>
            {/* Mobile hamburger */}
            <button onClick={() => setMenuOpen(o => !o)} aria-label="Menu"
              style={{ color: 'rgba(255,255,255,0.85)', background: 'none', border: 'none', cursor: 'pointer', display: 'none' }}
              className="mobile-menu-btn">
              {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── ROW 2: navigation ───────────────────────────── */}
      <div className="header-nav-row" style={{ backgroundColor: NAV_BG, borderBottom: `1px solid ${BORDER}`, position: 'sticky', top: '76px', zIndex: 199 }}>
        <div className="hide-scrollbar" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '44px', overflowX: 'auto' }}>
          {NAV.map((item, i) => (
            <React.Fragment key={item.label}>
              <Link to={item.to} style={{
                fontFamily: 'Jost, sans-serif', fontSize: '0.68rem', fontWeight: 500,
                letterSpacing: '0.2em', textTransform: 'uppercase',
                color: location.pathname === item.to ? GOLD : 'rgba(255,255,255,0.8)',
                padding: '0 1.4rem', whiteSpace: 'nowrap',
                transition: 'color 0.2s', textDecoration: 'none',
              }}
                onMouseEnter={e => e.currentTarget.style.color = GOLD}
                onMouseLeave={e => e.currentTarget.style.color = location.pathname === item.to ? GOLD : 'rgba(255,255,255,0.8)'}>
                {item.label}
              </Link>
              {i < NAV.length - 1 && <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: '0.65rem' }}>|</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Mobile full-screen menu ──────────────────────── */}
      {menuOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: TOP_BG, zIndex: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2.5rem' }}>
          <button onClick={() => setMenuOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: 'rgba(255,255,255,0.7)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <FiX size={26} />
          </button>
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 600, letterSpacing: '0.5em', color: GOLD, paddingLeft: '0.5em' }}>RAVARI</span>
          <div style={{ height: '1px', width: '40px', background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />
          {NAV.map(item => (
            <Link key={item.label} to={item.to} style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.85rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>
              {item.label}
            </Link>
          ))}
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <a href="tel:+919084260869" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontFamily: 'Jost, sans-serif' }}>
              <FiPhone size={13} style={{ color: GOLD }} /> +91 90842 60869
            </a>
            <a href="mailto:ravari.store@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontFamily: 'Jost, sans-serif' }}>
              <FiMail size={13} style={{ color: GOLD }} /> ravari.store@gmail.com
            </a>
          </div>
        </div>
      )}

      {/* ── Responsive styles ───────────────────────────── */}
      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
          .header-email    { display: none !important; }
          .header-top-row  { height: 62px !important; padding: 0 1rem !important; }
          .ravari-wordmark { font-size: 1.7rem !important; letter-spacing: 0.4em !important; padding-left: 0.4em !important; }
          .ravari-tagline  { display: none !important; }
          .header-nav-row  { top: 62px !important; }
        }
        @media (max-width: 480px) {
          .ravari-wordmark { font-size: 1.45rem !important; letter-spacing: 0.3em !important; }
        }
      `}</style>
    </>
  );
}
