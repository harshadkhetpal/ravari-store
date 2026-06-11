import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiSearch, FiHeart, FiShoppingBag, FiMenu, FiX } from 'react-icons/fi';

const NAV_LINKS = [
  { label: 'Shop',        to: '/products' },
  { label: 'Collections', to: '/products' },
  { label: 'About',       to: '/about' },
  { label: 'Contact',     to: '/contact' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location                = useLocation();
  const cartItems               = useSelector(s => s.cart?.items || []);
  const cartCount               = cartItems.reduce((n, i) => n + (i.quantity || 1), 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  return (
    <>
      {/* Main header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E0DBD4',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.06)' : 'none',
        transition: 'box-shadow 0.3s ease',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', height: '68px' }}>

          {/* Left nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="hidden-mobile">
            {NAV_LINKS.slice(0, 2).map(l => (
              <Link key={l.label} to={l.to} className="nav-link">{l.label}</Link>
            ))}
          </nav>

          {/* Logo — centered */}
          <Link to="/" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.9rem', fontWeight: 600, letterSpacing: '0.18em', color: '#0D0D0D', lineHeight: 1 }}>RAVARI</span>
            <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.48rem', fontWeight: 400, letterSpacing: '0.35em', color: '#C9A84C', textTransform: 'uppercase' }}>Purposefully Crafted</span>
          </Link>

          {/* Right: nav + icons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2rem' }}>
            <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="hidden-mobile">
              {NAV_LINKS.slice(2).map(l => (
                <Link key={l.label} to={l.to} className="nav-link">{l.label}</Link>
              ))}
            </nav>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem' }}>
              <button aria-label="Search" style={{ color: '#0D0D0D', display: 'flex', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color='#C9A84C'} onMouseLeave={e => e.currentTarget.style.color='#0D0D0D'}>
                <FiSearch size={17} />
              </button>
              <Link to="/wishlist" aria-label="Wishlist" style={{ color: '#0D0D0D', display: 'flex', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color='#C9A84C'} onMouseLeave={e => e.currentTarget.style.color='#0D0D0D'}>
                <FiHeart size={17} />
              </Link>
              <Link to="/cart" aria-label="Cart" style={{ color: '#0D0D0D', display: 'flex', position: 'relative', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color='#C9A84C'} onMouseLeave={e => e.currentTarget.style.color='#0D0D0D'}>
                <FiShoppingBag size={17} />
                {cartCount > 0 && (
                  <span style={{ position: 'absolute', top: '-6px', right: '-7px', backgroundColor: '#C9A84C', color: '#0D0D0D', fontSize: '0.5rem', fontWeight: 700, width: '15px', height: '15px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cartCount}</span>
                )}
              </Link>
              <button className="show-mobile" onClick={() => setMenuOpen(o => !o)} aria-label="Menu" style={{ color: '#0D0D0D', display: 'none' }}>
                {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile full-screen menu */}
      {menuOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: '#FFFFFF', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2.5rem' }}>
          <button onClick={() => setMenuOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: '#0D0D0D' }}>
            <FiX size={24} />
          </button>
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', fontWeight: 600, letterSpacing: '0.2em' }}>RAVARI</span>
          <div className="divider-gold" style={{ width: '40px' }} />
          {NAV_LINKS.map(l => (
            <Link key={l.label} to={l.to} style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.75rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#0D0D0D' }}>{l.label}</Link>
          ))}
        </div>
      )}
    </>
  );
}
