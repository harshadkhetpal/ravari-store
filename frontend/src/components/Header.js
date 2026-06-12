import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiSearch, FiHeart, FiShoppingBag, FiMenu, FiX, FiPhone } from 'react-icons/fi';

const NAV = [
  { label: 'About Us',    to: '/about' },
  { label: 'Shop',        to: '/products' },
  { label: 'Collection',  to: '/products' },
  { label: 'Sling Bags',  to: '/products?category=Sling+Bags' },
  { label: 'Watch Box',   to: '/products?category=Watch+Box' },
  { label: 'Tote Bags',   to: '/products?category=Tote+Bags' },
  { label: 'Jewellery Box', to: '/products?category=Jewellery+Box' },
  { label: 'Contact',     to: '/contact' },
];

const TOP_BG  = '#0D0B08';
const NAV_BG  = '#1A1510';
const GOLD    = '#C9A84C';
const BORDER  = 'rgba(201,168,76,0.15)';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const cartItems  = useSelector(s => s.cart?.items || []);
  const cartCount  = cartItems.reduce((n, i) => n + (i.quantity || 1), 0);

  useEffect(() => { setMenuOpen(false); }, [location]);

  return (
    <>
      {/* ── ROW 1: phone | RAVARI | icons ──────────────── */}
      <div style={{
        backgroundColor: TOP_BG,
        borderBottom: `1px solid ${BORDER}`,
        position: 'sticky', top: 0, zIndex: 200,
      }}>
        <div style={{
          maxWidth: '1400px', margin: '0 auto',
          padding: '0 2rem',
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          height: '64px',
        }}>

          {/* Left — phone */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiPhone size={13} style={{ color: GOLD }} />
            <a href="tel:+919084260869"
              style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.68rem', fontWeight: 400, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.75)', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = GOLD}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}>
              +91 90842 60869
            </a>
          </div>

          {/* Center — RAVARI wordmark */}
          <Link to="/" style={{ textAlign: 'center', textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.75rem',
              fontWeight: 600,
              letterSpacing: '0.55em',
              color: GOLD,
              lineHeight: 1,
              paddingLeft: '0.55em', /* offset for letter-spacing */
            }}>
              RAVARI
            </span>
            <span style={{
              fontFamily: 'Jost, sans-serif',
              fontSize: '0.42rem',
              fontWeight: 400,
              letterSpacing: '0.22em',
              color: 'rgba(201,168,76,0.65)',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}>
              DURABLE &nbsp;|&nbsp; TEXTURED &nbsp;|&nbsp; FULL GRAIN &nbsp;|&nbsp; STITCHED &nbsp;|&nbsp; REINFORCED
            </span>
          </Link>

          {/* Right — icons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1.25rem' }}>
            {/* Search */}
            <button aria-label="Search"
              style={{ color: 'rgba(255,255,255,0.75)', display: 'flex', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = GOLD}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}>
              <FiSearch size={17} />
            </button>

            {/* Wishlist */}
            <Link to="/wishlist" aria-label="Wishlist"
              style={{ color: 'rgba(255,255,255,0.75)', display: 'flex', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = GOLD}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}>
              <FiHeart size={17} />
            </Link>

            {/* Cart */}
            <Link to="/cart" aria-label="Cart"
              style={{ color: 'rgba(255,255,255,0.75)', display: 'flex', position: 'relative', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = GOLD}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}>
              <FiShoppingBag size={17} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-6px', right: '-7px',
                  backgroundColor: GOLD, color: '#0D0D0D',
                  fontSize: '0.48rem', fontWeight: 700,
                  width: '15px', height: '15px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Menu"
              style={{ color: 'rgba(255,255,255,0.75)', display: 'none', background: 'none', border: 'none', cursor: 'pointer' }}
              className="show-mobile">
              {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── ROW 2: navigation ───────────────────────────── */}
      <div style={{
        backgroundColor: NAV_BG,
        borderBottom: `1px solid ${BORDER}`,
        position: 'sticky', top: '64px', zIndex: 199,
      }}>
        <div style={{
          maxWidth: '1400px', margin: '0 auto',
          padding: '0 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0',
          height: '42px',
          overflowX: 'auto',
        }} className="hide-scrollbar">
          {NAV.map((item, i) => (
            <React.Fragment key={item.label}>
              <Link
                to={item.to}
                style={{
                  fontFamily: 'Jost, sans-serif',
                  fontSize: '0.62rem',
                  fontWeight: 500,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: location.pathname === item.to ? GOLD : 'rgba(255,255,255,0.72)',
                  padding: '0 1.1rem',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.2s',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => e.currentTarget.style.color = GOLD}
                onMouseLeave={e => e.currentTarget.style.color = location.pathname === item.to ? GOLD : 'rgba(255,255,255,0.72)'}>
                {item.label}
              </Link>
              {i < NAV.length - 1 && (
                <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.6rem' }}>|</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Mobile full-screen menu ──────────────────────── */}
      {menuOpen && (
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: TOP_BG,
          zIndex: 300,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '2rem',
        }}>
          <button onClick={() => setMenuOpen(false)}
            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: 'rgba(255,255,255,0.7)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <FiX size={24} />
          </button>
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', fontWeight: 600, letterSpacing: '0.5em', color: GOLD, paddingLeft: '0.5em' }}>RAVARI</span>
          <div style={{ height: '1px', width: '40px', background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />
          {NAV.map(item => (
            <Link key={item.label} to={item.to}
              style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.72rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
