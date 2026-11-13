import React from 'react';
import { openConsent } from '../components/AnalyticsProvider';

const H = { fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontWeight: 500, color: '#0D0D0D', margin: '2rem 0 0.6rem' };
const P = { fontFamily: 'Jost, sans-serif', fontSize: '0.85rem', lineHeight: 1.8, color: '#4A4642', margin: '0 0 0.8rem' };

export default function PrivacyPolicy() {
  return (
    <div style={{ background: '#fff', padding: '3rem 1.5rem 5rem' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.2rem', fontWeight: 400, color: '#0D0D0D' }}>Privacy Policy &amp; Analytics</h1>
        <p style={P}>RAVARI respects your privacy. This page explains what we collect when you browse ravari.in and what choices you have, in line with India's Digital Personal Data Protection Act, 2023.</p>

        <h2 style={H}>Orders and enquiries</h2>
        <p style={P}>When you place an order or contact us we use your name, phone, email and address only to deliver your order, take payment through Razorpay, provide support and meet legal and tax duties.</p>

        <h2 style={H}>Website analytics (only with your permission)</h2>
        <p style={P}>If you choose “Accept analytics”, we record, under a random anonymous ID: the pages you view and for how long, products you look at, buttons and images you click, items added to or removed from your cart, the steps you reach in checkout, how you arrived (e.g. Instagram, Google, an advertisement), and your device and browser type.</p>
        <p style={P}>We do <strong>not</strong> record what you type into forms, passwords, OTPs, card or bank details, your IP address or keystrokes. We do not try to work out who you are from this data.</p>
        <p style={P}>We use this to understand which products interest visitors, where people leave, and which of our marketing works, so we can improve the site. It is not sold or shared with third parties.</p>

        <h2 style={H}>How long we keep it</h2>
        <p style={P}>Analytics events are deleted automatically after 13 months. Order records are kept as long as the law requires, but are disconnected from your browsing ID after that period.</p>

        <h2 style={H}>Your choices</h2>
        <p style={P}>You can withdraw consent at any time, which stops tracking and deletes the analytics data held under your anonymous ID.</p>
        <p style={{ ...P }}>
          <button onClick={openConsent} style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '0.7rem 1.4rem', background: '#0D0D0D', color: '#fff', border: 'none', cursor: 'pointer' }}>Change cookie settings</button>
        </p>

        <h2 style={H}>Third-party tools</h2>
        <p style={P}>Our advertising and measurement partners (Google Analytics / Tag Manager and Meta Pixel) may set their own cookies, governed by their own policies.</p>

        <h2 style={H}>Contact</h2>
        <p style={P}>To ask about, correct or delete your data, email ravari.store@gmail.com.</p>
      </div>
    </div>
  );
}
