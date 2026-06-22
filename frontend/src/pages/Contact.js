import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import { SEO_CONFIG } from '../utils/seoConstants';
import { getOrganizationSchema, getLocalBusinessSchema } from '../utils/schemaMarkup';
import { trackPageView, trackFormSubmission } from '../utils/ga4Tracking';
import api from '../api/axiosConfig';

const GOLD = '#C9A84C';
const BG = '#0D0B08';
const CARD_BG = '#1A1510';
const BORDER = 'rgba(201,168,76,0.2)';

function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');

  useEffect(() => { trackPageView('/contact', 'Contact RAVARI'); }, []);

  const pageSchema = {
    '@context': 'https://schema.org',
    '@graph': [getOrganizationSchema(), getLocalBusinessSchema()]
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true); setSendError('');
    try {
      await api.post('/contact', formData);
      trackFormSubmission('contact');
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch {
      setSendError('Could not send message. Please WhatsApp or email us directly.');
    } finally {
      setSending(false);
    }
  };

  const whatsappUrl = `https://wa.me/919084260869?text=${encodeURIComponent('Hi RAVARI! I would like to know more about your products.')}`;

  const inputStyle = {
    width: '100%', padding: '0.85rem 1rem',
    backgroundColor: '#0D0B08',
    border: `1px solid ${BORDER}`,
    color: '#E8D5A3',
    fontFamily: 'Jost, sans-serif', fontSize: '0.85rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    display: 'block',
    fontFamily: 'Jost, sans-serif', fontSize: '0.6rem',
    fontWeight: 600, letterSpacing: '0.15em',
    textTransform: 'uppercase', color: GOLD,
    marginBottom: '0.45rem',
  };

  return (
    <div style={{ backgroundColor: BG, minHeight: '100vh', color: '#E8D5A3' }}>
      <SEO
        title="Contact RAVARI | Luxury Leather Goods"
        description="Get in touch with RAVARI for inquiries, custom orders, or customer support. Available online or visit us in Lucknow."
        canonical={`${SEO_CONFIG.site.url}/contact`}
        schemaMarkup={pageSchema}
      />

      {/* Hero */}
      <div style={{ backgroundColor: '#1A1510', borderBottom: `1px solid ${BORDER}`, padding: '4rem 2rem 3.5rem', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.58rem', fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase', color: GOLD, marginBottom: '0.7rem' }}>
          We'd Love To Hear From You
        </p>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 400, color: '#FFFFFF', lineHeight: 1.15, marginBottom: '1rem' }}>
          Contact RAVARI
        </h1>
        <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.85rem', color: 'rgba(232,213,163,0.65)', maxWidth: '480px', margin: '0 auto' }}>
          Reach out for inquiries, custom orders, or any questions about our handcrafted leather goods.
        </p>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '4rem 2rem 6rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem' }}>

          {/* Contact Form */}
          <div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', fontWeight: 400, color: '#FFFFFF', marginBottom: '2rem' }}>
              Send a Message
            </h2>

            {submitted && (
              <div style={{ backgroundColor: 'rgba(201,168,76,0.1)', border: `1px solid ${GOLD}`, padding: '1rem 1.25rem', marginBottom: '1.5rem', color: GOLD, fontFamily: 'Jost, sans-serif', fontSize: '0.8rem' }}>
                ✓ Message sent. We'll respond within 24 hours.
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Your full name" style={inputStyle} required />
              </div>
              <div>
                <label style={labelStyle}>Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" style={inputStyle} required />
              </div>
              <div>
                <label style={labelStyle}>Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 XXXXXXXXXX" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Message</label>
                <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Tell us about your inquiry..." rows="5" style={{ ...inputStyle, resize: 'vertical' }} required />
              </div>

              {sendError && (
                <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.75rem', color: '#E05252' }}>{sendError}</p>
              )}

              <button type="submit" disabled={sending}
                style={{
                  backgroundColor: GOLD, color: '#0D0B08',
                  border: 'none', padding: '1rem 2rem',
                  fontFamily: 'Jost, sans-serif', fontSize: '0.65rem',
                  fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
                  cursor: sending ? 'not-allowed' : 'pointer',
                  opacity: sending ? 0.7 : 1,
                  transition: 'opacity 0.2s',
                }}>
                {sending ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', fontWeight: 400, color: '#FFFFFF', marginBottom: '2rem' }}>
              Get In Touch
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
              {[
                { label: 'Email', value: 'ravari.store@gmail.com', href: 'mailto:ravari.store@gmail.com', note: 'We respond within 24 hours' },
                { label: 'Phone', value: '+91 90842 60869', href: 'tel:+919084260869', note: 'Mon–Sat, 10 AM – 6 PM' },
                { label: 'Address', value: '4A Prakash Apartment, 44A Cantt Road, Lucknow – 226001, UP', href: null, note: null },
                { label: 'Online Support', value: '24 / 7 Available', href: null, note: 'WhatsApp anytime' },
              ].map((item) => (
                <div key={item.label} style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}`, padding: '1.25rem 1.5rem' }}>
                  <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.58rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: GOLD, marginBottom: '0.4rem' }}>
                    {item.label}
                  </p>
                  {item.href ? (
                    <a href={item.href} style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.9rem', color: '#E8D5A3', textDecoration: 'none' }}>
                      {item.value}
                    </a>
                  ) : (
                    <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.9rem', color: '#E8D5A3', margin: 0 }}>{item.value}</p>
                  )}
                  {item.note && (
                    <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.7rem', color: 'rgba(232,213,163,0.5)', marginTop: '0.3rem', margin: 0 }}>{item.note}</p>
                  )}
                </div>
              ))}
            </div>

            {/* WhatsApp Button */}
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
              style={{
                display: 'block', textAlign: 'center',
                backgroundColor: '#25D366', color: '#FFFFFF',
                padding: '1rem', textDecoration: 'none',
                fontFamily: 'Jost, sans-serif', fontSize: '0.7rem',
                fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
                marginBottom: '2rem',
              }}>
              Chat on WhatsApp
            </a>

            {/* FAQ */}
            <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: '2rem' }}>
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontWeight: 400, color: '#FFFFFF', marginBottom: '1.25rem' }}>
                Frequently Asked Questions
              </h3>
              {[
                { q: 'What is your return policy?', a: '7-day hassle-free returns on all products in original condition with all tags intact.' },
                { q: 'Do you ship internationally?', a: 'Yes, we ship to most countries worldwide. Rates vary by location.' },
                { q: 'Can I customize my order?', a: 'Yes! We offer personalization services. Contact us for details.' },
                { q: 'How do I track my order?', a: 'Visit ravari.in/track-order with your Order ID (starts with RAV) and email.' },
              ].map((item, i) => (
                <div key={i} style={{ borderBottom: `1px solid ${BORDER}`, padding: '1rem 0' }}>
                  <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.8rem', fontWeight: 600, color: GOLD, marginBottom: '0.4rem' }}>{item.q}</p>
                  <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.78rem', color: 'rgba(232,213,163,0.7)', margin: 0 }}>{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
