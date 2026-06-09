import React from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiLinkedin, FiMail, FiPhone } from 'react-icons/fi';

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: 'var(--charcoal)', color: 'var(--ivory)' }}>

      {/* TAGLINE BAND */}
      <div style={{ borderTop: '1px solid var(--gold)', borderBottom: '1px solid rgba(212,175,55,0.2)', padding: '1.4rem 0', textAlign: 'center', background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.07), transparent)' }}>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontStyle: 'italic', fontWeight: 300, color: 'var(--gold)', letterSpacing: '0.04em' }}>
          "Purposefully Crafted. Redefine with Every Detail."
        </p>
      </div>

      {/* MAIN FOOTER */}
      <div className="container" style={{ padding: '5rem 2rem 3rem' }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/"><img src="/images/Ravari%20Logo%20Banner.jpeg" alt="RAVARI" style={{ height: '40px', maxWidth: '130px', objectFit: 'contain', marginBottom: '1.4rem', filter: 'brightness(0) invert(1)', opacity: 0.9 }} /></Link>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', lineHeight: '1.8', color: 'rgba(248,248,244,0.55)', marginBottom: '1.8rem' }}>
              Handcrafted leather goods that blend timeless design with modern functionality. Made in India, built to last a lifetime.
            </p>
            <div className="flex items-center gap-4">
              {[
                { href: 'https://www.instagram.com/ravari_store', Icon: FiInstagram },
                { href: 'https://www.facebook.com/profile.php?id=61585497611013', Icon: FiFacebook },
                { href: 'https://www.linkedin.com/in/ravari-store-854b98406', Icon: FiLinkedin },
              ].map(({ href, Icon }, i) => (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px', border: '1px solid rgba(212,175,55,0.3)', color: 'rgba(248,248,244,0.6)', transition: 'var(--transition)', borderRadius: '2px' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)'; e.currentTarget.style.backgroundColor = 'rgba(212,175,55,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)'; e.currentTarget.style.color = 'rgba(248,248,244,0.6)'; e.currentTarget.style.backgroundColor = 'transparent'; }}>
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h5 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1.4rem' }}>Shop</h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[{to:'/products',l:'All Products'},{to:'/products?category=bags',l:'Leather Bags'},{to:'/products?category=wallets',l:'Wallets'},{to:'/products?category=accessories',l:'Accessories'},{to:'/wishlist',l:'Wishlist'}].map(({to,l}) => (
                <li key={l}><Link to={to} style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'rgba(248,248,244,0.55)', transition: 'var(--transition)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(248,248,244,0.55)'}>{l}</Link></li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h5 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1.4rem' }}>Information</h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[{to:'/about',l:'Our Story'},{to:'/contact',l:'Contact Us'},{href:'#',l:'Privacy Policy'},{href:'#',l:'Terms of Service'},{href:'#',l:'Shipping Policy'}].map(({to,href,l}) => (
                <li key={l}>{to ? <Link to={to} style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'rgba(248,248,244,0.55)', transition: 'var(--transition)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(248,248,244,0.55)'}>{l}</Link> : <a href={href} style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'rgba(248,248,244,0.55)', transition: 'var(--transition)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(248,248,244,0.55)'}>{l}</a>}</li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1.4rem' }}>Get in Touch</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '2rem' }}>
              <a href="tel:+919084260869" className="flex items-center gap-2" style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'rgba(248,248,244,0.55)', transition: 'var(--transition)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(248,248,244,0.55)'}><FiPhone size={13} style={{ color: 'var(--gold)', flexShrink: 0 }} />+91 90842 60869</a>
              <a href="mailto:ravari.store@gmail.com" className="flex items-center gap-2" style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'rgba(248,248,244,0.55)', transition: 'var(--transition)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(248,248,244,0.55)'}><FiMail size={13} style={{ color: 'var(--gold)', flexShrink: 0 }} />ravari.store@gmail.com</a>
            </div>
            <h5 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1rem' }}>Also Available On</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[{href:'https://www.amazon.in/s?k=ravari',l:'Amazon'},{href:'https://www.meesho.com/ravari',l:'Meesho'}].map(({href,l}) => (
                <a key={l} href={href} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(248,248,244,0.55)', transition: 'var(--transition)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(248,248,244,0.55)'}> → {l}</a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div style={{ borderTop: '1px solid rgba(212,175,55,0.15)', padding: '1.4rem 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', padding: '0 2rem' }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', color: 'rgba(248,248,244,0.35)', letterSpacing: '0.04em' }}>&copy; {year} RAVARI. All rights reserved.</p>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', color: 'rgba(248,248,244,0.25)', letterSpacing: '0.04em' }}>Luxury Handcrafted Leather Goods — Made in India</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
