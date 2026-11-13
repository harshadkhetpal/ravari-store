import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getConsent, setConsent, pageView, initTracker } from '../utils/tracker';

const GOLD = '#C9A84C';

/* Sends a page_view on every route change (SPA navigation). Renders nothing. */
export function RouteTracker() {
  const location = useLocation();
  useEffect(() => { initTracker(); }, []);
  useEffect(() => { pageView(); }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

/* Consent notice. Analytics only start after "Accept". "Cookie settings" in the footer reopens it. */
export function ConsentBanner() {
  const [open, setOpen] = useState(() => getConsent() === null);
  useEffect(() => {
    const reopen = () => setOpen(true);
    window.addEventListener('ravari-open-consent', reopen);
    return () => window.removeEventListener('ravari-open-consent', reopen);
  }, []);
  if (!open) return null;
  const current = getConsent();
  const choose = (v) => { setConsent(v); setOpen(false); };
  const btn = { fontFamily: 'Jost, sans-serif', fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase', padding: '0.7rem 1.4rem', cursor: 'pointer', border: `1px solid ${GOLD}` };
  return (
    <div role="dialog" aria-label="Privacy choices" data-no-track
      style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 9999, background: '#0D0B08', borderTop: `1px solid ${GOLD}`, padding: '1.1rem 1.25rem', boxShadow: '0 -6px 30px rgba(0,0,0,0.35)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <p style={{ flex: '1 1 420px', margin: 0, fontFamily: 'Jost, sans-serif', fontSize: '0.78rem', lineHeight: 1.65, color: 'rgba(255,255,255,0.85)' }}>
          <strong style={{ color: GOLD }}>Help us improve RAVARI.</strong> With your permission we record which pages, products and buttons you use, your device type and how you reached us, using a random ID —
          never your name, contact details, payment details or anything you type. You can change this any time from “Cookie settings” in the footer.{' '}
          <Link to="/privacy-policy" onClick={() => setOpen(false)} style={{ color: GOLD, textDecoration: 'underline' }}>Privacy policy</Link>
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={() => choose(false)} style={{ ...btn, background: 'transparent', color: current && current.analytics === false ? GOLD : '#fff' }}>Essential only</button>
          <button onClick={() => choose(true)} style={{ ...btn, background: GOLD, color: '#0D0D0D', fontWeight: 600 }}>Accept analytics</button>
        </div>
      </div>
    </div>
  );
}
export const openConsent = () => window.dispatchEvent(new Event('ravari-open-consent'));
