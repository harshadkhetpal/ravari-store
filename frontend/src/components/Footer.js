import React from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiLinkedin, FiMail, FiPhone } from 'react-icons/fi';

function Footer() {
  return (
    <footer style={{ backgroundColor: '#0D0D0D', color: '#FFFFFF' }}>
      <div className="divider-gold" />

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '5rem 2rem 3rem' }}>
        {/* Top grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr', gap: '3rem', marginBottom: '4rem' }}>

          {/* Brand */}
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.8rem', fontWeight: 600, letterSpacing: '0.18em', color: '#FFFFFF' }}>RAVARI</span>
              <div style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.48rem', fontWeight: 400, letterSpacing: '0.35em', color: '#C9A84C', textTransform: 'uppercase', marginTop: '3px' }}>Purposefully Crafted</div>
            </div>
            <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1rem', fontStyle: 'italic', lineHeight: 1.8, color: 'rgba(255,255,255,0.55)', maxWidth: '280px', marginBottom: '2rem' }}>
              Handcrafted leather goods, born from a devotion to timeless elegance and artisan precision.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {[
                { href: 'https://www.instagram.com/ravari_store?igsh=MXNkdjBmZnFnMjAwcg==', icon: <FiInstagram size={16} />, label: 'Instagram' },
                { href: 'https://www.facebook.com/profile.php?id=61585497611013',             icon: <FiFacebook size={16} />,  label: 'Facebook' },
                { href: 'https://www.linkedin.com/in/ravari-store-854b98406',                icon: <FiLinkedin size={16} />,  label: 'LinkedIn' },
              ].map(({ href, icon, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  style={{ color: 'rgba(255,255,255,0.4)', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color='#C9A84C'}
                  onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.4)'}>
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="label" style={{ color: '#C9A84C', marginBottom: '1.5rem' }}>Shop</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {[
                { to: '/products',                         label: 'All Products' },
                { to: '/products?category=Sling+Bags',    label: 'Sling Bags' },
                { to: '/products?category=Tote+Bags',     label: 'Tote Bags' },
                { to: '/products?category=Handbags',      label: 'Handbags' },
                { to: '/products?category=Organizers',    label: 'Accessories' },
              ].map(({ to, label }) => (
                <li key={label}>
                  <Link to={to} style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color='#FFFFFF'}
                    onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.5)'}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="label" style={{ color: '#C9A84C', marginBottom: '1.5rem' }}>Company</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {[
                { to: '/about',         label: 'Our Story' },
                { to: '/contact',       label: 'Contact Us' },
                { to: '/return-policy', label: 'Return Policy' },
                { to: '/products',      label: 'Collections' },
              ].map(({ to, label }) => (
                <li key={label}>
                  <Link to={to} style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color='#FFFFFF'}
                    onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.5)'}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="label" style={{ color: '#C9A84C', marginBottom: '1.5rem' }}>Get in Touch</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li>
                <a href="tel:+919084260869"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontFamily: 'Jost, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color='#FFFFFF'}
                  onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.5)'}>
                  <FiPhone size={13} style={{ color: '#C9A84C', flexShrink: 0 }} />
                  +91 90842 60869
                </a>
              </li>
              <li>
                <a href="mailto:Ravari.store@gmail.com"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontFamily: 'Jost, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color='#FFFFFF'}
                  onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.5)'}>
                  <FiMail size={13} style={{ color: '#C9A84C', flexShrink: 0 }} />
                  Ravari.store@gmail.com
                </a>
              </li>
            </ul>

            {/* Newsletter teaser */}
            <div style={{ marginTop: '2rem', padding: '1.25rem', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '2px' }}>
              <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.4rem' }}>Stay in the loop</p>
              <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>New arrivals, craft stories & exclusive offers.</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em' }}>
            &copy; {new Date().getFullYear()} RAVARI. All rights reserved. Handcrafted in India.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/return-policy"
              style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', transition: 'color 0.2s', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.6)'}
              onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.25)'}>Return Policy</Link>
            {['Privacy Policy', 'Terms of Service'].map(label => (
              <a key={label} href="#"
                style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.6)'}
                onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.25)'}>{label}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
