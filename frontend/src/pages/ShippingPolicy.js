import React from 'react';
import { Link } from 'react-router-dom';
import { FiTruck, FiPackage, FiClock, FiMapPin, FiAlertCircle, FiPhone } from 'react-icons/fi';

const GOLD = '#C9A84C';
const DARK = '#0D0B08';

const SUMMARY = [
  { icon: <FiTruck size={20} style={{ color: GOLD }} />, title: 'Free Shipping', desc: 'On orders above ₹5,000' },
  { icon: <FiClock size={20} style={{ color: GOLD }} />, title: '5–7 Days', desc: 'Standard delivery time' },
  { icon: <FiMapPin size={20} style={{ color: GOLD }} />, title: 'Pan India', desc: 'We ship to all states' },
  { icon: <FiPackage size={20} style={{ color: GOLD }} />, title: 'Tracked', desc: 'Full order tracking' },
];

const SECTIONS = [
  {
    title: 'Shipping Methods & Timeframes',
    content: [
      'Standard Delivery (5–7 Business Days): Available across India. Orders are processed within 1–2 business days of payment confirmation.',
      'Standard Delivery (4–7 Business Days): Available pan-India via trusted courier partners.',
      'Same-Day / Next-Day Delivery: Not currently available. We are working to offer this in select locations.',
      'Business days exclude Sundays and public holidays.',
    ],
  },
  {
    title: 'Shipping Charges',
    content: [
      'Orders above ₹5,000: FREE standard shipping.',
      'Orders below ₹5,000: ₹100 flat shipping charge.',
      'Remote or difficult-to-access areas (as defined by our courier partner) may incur additional charges. We will notify you if this applies to your order.',
    ],
  },
  {
    title: 'Order Processing',
    content: [
      'Orders placed before 2:00 PM IST on business days are processed the same day.',
      'Orders placed after 2:00 PM IST, on weekends, or on public holidays will be processed the next business day.',
      'You will receive an order confirmation email immediately after placing the order, and a shipping confirmation email with tracking details once dispatched.',
      'Please ensure your delivery address is complete and accurate. RAVARI is not responsible for delays caused by incorrect address details.',
    ],
  },
  {
    title: 'Tracking Your Order',
    content: [
      'Once your order is shipped, you will receive a tracking number via email.',
      'You can track your order anytime at ravari.in/track-order using your Order ID.',
      'Tracking information may take up to 24 hours to update after shipment.',
      'For real-time assistance, WhatsApp us at +91 90842 60869 with your Order ID.',
    ],
  },
  {
    title: 'Cash on Delivery (COD)',
    content: [
      'COD is available across most serviceable PIN codes in India.',
      'Please keep the exact amount ready at the time of delivery.',
      'COD orders may take an additional 1–2 business days to process due to verification.',
      'RAVARI reserves the right to refuse COD for certain remote locations or high-value orders at its discretion.',
    ],
  },
  {
    title: 'Packaging',
    content: [
      'All RAVARI products are shipped in our signature luxury packaging — designed to protect and present your leather goods in pristine condition.',
      'For gifting, we offer complimentary gift wrapping. Please mention it in the order notes at checkout.',
      'We use eco-conscious packaging materials wherever possible, in keeping with our commitment to responsible craftsmanship.',
    ],
  },
  {
    title: 'Delays & Exceptions',
    content: [
      'RAVARI is not liable for delays caused by courier partners, natural events, strikes, or circumstances beyond our control.',
      'During peak periods (festivals, sale events), delivery timelines may be extended by 2–3 additional business days.',
      'If your order has not arrived within 10 business days of the expected delivery date, please contact us immediately.',
      'Damaged-in-transit products must be reported within 48 hours of delivery with photographs. See our Return Policy for next steps.',
    ],
  },
  {
    title: 'International Shipping',
    content: [
      'RAVARI currently ships within India only.',
      'International shipping is planned for a future phase. Join our newsletter or follow us on Instagram (@ravari_store) to be notified when we expand.',
    ],
  },
];

export default function ShippingPolicy() {
  return (
    <div style={{ backgroundColor: '#F8F7F5', minHeight: '100vh', fontFamily: 'Jost, sans-serif' }}>

      {/* Hero */}
      <div style={{ backgroundColor: DARK, padding: '4rem 2rem', textAlign: 'center' }}>
        <FiTruck size={40} style={{ color: GOLD, marginBottom: '1rem' }} />
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 400, color: '#FFFFFF', marginBottom: '0.75rem' }}>
          Shipping Policy
        </h1>
        <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Everything you need to know about delivery
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E8E4DE', padding: '2rem' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
          {SUMMARY.map(({ icon, title, desc }) => (
            <div key={title} style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>{icon}</div>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: DARK, marginBottom: '0.2rem' }}>{title}</p>
              <p style={{ fontSize: '0.68rem', color: '#8C8680' }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>

        <p style={{ fontSize: '0.82rem', color: '#4A4642', lineHeight: 1.8, marginBottom: '2.5rem', padding: '1.25rem 1.5rem', backgroundColor: '#fff', border: `1px solid rgba(201,168,76,0.35)`, borderLeft: `3px solid ${GOLD}` }}>
          At RAVARI, we pack every order with the same care that goes into crafting our leather goods. This policy explains how we handle shipping, so you always know what to expect.
        </p>

        {SECTIONS.map(({ title, content }) => (
          <div key={title} style={{ marginBottom: '2.25rem' }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontWeight: 600, color: DARK, marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #E8E4DE' }}>{title}</h2>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {content.map((line, i) => (
                <li key={i} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: '#4A4642', lineHeight: 1.7 }}>
                  <span style={{ color: GOLD, marginTop: '4px', flexShrink: 0 }}>·</span>
                  {line}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Contact */}
        <div style={{ backgroundColor: DARK, padding: '1.75rem 2rem', marginTop: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <FiPhone size={16} style={{ color: GOLD, flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.25rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Have a question about your shipment?</p>
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
                WhatsApp: <a href="https://wa.me/919084260869" target="_blank" rel="noreferrer" style={{ color: GOLD, textDecoration: 'none' }}>+91 90842 60869</a><br />
                Email: <a href="mailto:ravari.store@gmail.com" style={{ color: GOLD, textDecoration: 'none' }}>ravari.store@gmail.com</a>
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/track-order" style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: DARK, backgroundColor: GOLD, padding: '0.65rem 1.5rem', textDecoration: 'none', border: `1px solid ${GOLD}` }}>
              Track My Order
            </Link>
            <Link to="/return-policy" style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', backgroundColor: 'transparent', padding: '0.65rem 1.5rem', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)' }}>
              Return Policy
            </Link>
          </div>
        </div>

        <p style={{ fontSize: '0.62rem', color: '#8C8680', marginTop: '1.5rem', textAlign: 'center' }}>
          Last updated: June 2025. RAVARI reserves the right to modify this policy at any time.
        </p>
      </div>
    </div>
  );
}
