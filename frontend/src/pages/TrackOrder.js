import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiPackage, FiTruck, FiCheckCircle, FiClock, FiMapPin, FiPhone, FiMail, FiRotateCcw, FiAlertCircle } from 'react-icons/fi';

const GOLD = '#C9A84C';
const DARK = '#0D0B08';

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered'];
const STATUS_LABELS = { pending: 'Order Placed', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered' };
const STATUS_ICONS = { pending: FiClock, processing: FiPackage, shipped: FiTruck, delivered: FiCheckCircle };

export default function TrackOrder() {
  const [form, setForm] = useState({ orderId: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    if (!form.orderId.trim()) { setError('Please enter your Order ID.'); return; }
    setLoading(true);
    try {
      const id = form.orderId.trim().replace(/^RAV/i, '');
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id, email: form.email.trim() || undefined }),
      });
      const data = await res.json();
      if (data.found) {
        setResult(data.order);
      } else {
        setError('No order found with this ID' + (form.email ? ' and email combination.' : '. Please check your Order ID.'));
      }
    } catch {
      setError('Unable to fetch order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const status = result ? (result.status === 'cod_pending' ? 'pending' : result.status) : null;
  const statusIdx = STATUS_STEPS.indexOf(status);
  const isDelivered = result && (result.status === 'delivered');

  return (
    <div style={{ backgroundColor: '#F8F7F5', minHeight: '100vh', fontFamily: 'Jost, sans-serif' }}>

      {/* Hero */}
      <div style={{ backgroundColor: DARK, padding: '3.5rem 2rem', textAlign: 'center' }}>
        <FiTruck size={40} style={{ color: GOLD, marginBottom: '1rem' }} />
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, color: '#FFFFFF', marginBottom: '0.5rem' }}>
          Track Your Order
        </h1>
        <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Real-time order status updates
        </p>
      </div>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>

        {/* Search form */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E4DE', padding: '2rem', marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8C8680', marginBottom: '1.5rem', fontWeight: 600 }}>Enter Order Details</p>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4A4642', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Order ID *</label>
              <input
                type="text"
                placeholder="e.g. RAV1234 or 1234"
                value={form.orderId}
                onChange={e => setForm(f => ({ ...f, orderId: e.target.value }))}
                style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #D4CFC8', backgroundColor: '#FAFAF8', fontFamily: 'Jost, sans-serif', fontSize: '0.82rem', color: DARK, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4A4642', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Email Address <span style={{ color: '#8C8680', fontWeight: 400 }}>(optional, for verification)</span></label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #D4CFC8', backgroundColor: '#FAFAF8', fontFamily: 'Jost, sans-serif', fontSize: '0.82rem', color: DARK, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
                <FiAlertCircle size={14} style={{ color: '#DC2626', flexShrink: 0 }} />
                <p style={{ fontSize: '0.72rem', color: '#DC2626' }}>{error}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: GOLD, color: DARK, border: 'none', padding: '0.9rem 2rem', fontFamily: 'Jost, sans-serif', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', alignSelf: 'flex-start' }}
            >
              <FiSearch size={14} />
              {loading ? 'Searching…' : 'Track Order'}
            </button>
          </form>
        </div>

        {/* Results */}
        {result && (
          <>
            {/* Status tracker */}
            <div style={{ backgroundColor: '#fff', border: '1px solid #E8E4DE', padding: '1.75rem 2rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <p style={{ fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8C8680', fontWeight: 600 }}>Order Status</p>
                <p style={{ fontSize: '0.65rem', color: '#8C8680' }}>ID: <strong style={{ color: DARK }}>RAV{result.id}</strong></p>
              </div>

              {result.status === 'cancelled' ? (
                <div style={{ padding: '1rem', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', textAlign: 'center' }}>
                  <FiAlertCircle size={24} style={{ color: '#DC2626', marginBottom: '0.5rem' }} />
                  <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#DC2626' }}>This order has been cancelled.</p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: '1.5rem' }}>
                    {STATUS_STEPS.map((s, i) => {
                      const done = statusIdx >= i;
                      const active = statusIdx === i;
                      const Icon = STATUS_ICONS[s];
                      return (
                        <React.Fragment key={s}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', flex: '0 0 auto' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: done ? GOLD : '#E8E4DE', display: 'flex', alignItems: 'center', justifyContent: 'center', border: active ? `2px solid ${DARK}` : 'none' }}>
                              <Icon size={14} style={{ color: done ? DARK : '#8C8680' }} />
                            </div>
                            <span style={{ fontSize: '0.52rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: done ? DARK : '#8C8680', fontWeight: done ? 600 : 400, whiteSpace: 'nowrap' }}>
                              {STATUS_LABELS[s]}
                            </span>
                          </div>
                          {i < STATUS_STEPS.length - 1 && (
                            <div style={{ flex: 1, height: '2px', backgroundColor: statusIdx > i ? GOLD : '#E8E4DE', margin: '0 0.4rem', marginBottom: '1.4rem' }} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  <div style={{ padding: '0.85rem 1rem', backgroundColor: '#F8F5EF', border: `1px solid rgba(201,168,76,0.3)`, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FiTruck size={16} style={{ color: GOLD, flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: '0.72rem', fontWeight: 600, color: DARK }}>
                        {isDelivered ? 'Delivered Successfully' : 'Estimated Delivery: 5–7 Business Days'}
                      </p>
                      <p style={{ fontSize: '0.62rem', color: '#6B6560', marginTop: '2px' }}>
                        {isDelivered ? 'We hope you love your RAVARI piece.' : 'You\'ll receive a notification when your order ships.'}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Order items */}
            {result.items && result.items.length > 0 && (
              <div style={{ backgroundColor: '#fff', border: '1px solid #E8E4DE', padding: '1.5rem', marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8C8680', marginBottom: '1rem', fontWeight: 600 }}>Items in This Order</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {result.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      {item.image && <img src={item.image} alt={item.name} style={{ width: '52px', height: '52px', objectFit: 'contain', border: '1px solid #E8E4DE', backgroundColor: '#FAFAF8', flexShrink: 0 }} />}
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.78rem', fontWeight: 500, color: DARK, lineHeight: 1.3 }}>{item.name}</p>
                        <p style={{ fontSize: '0.65rem', color: '#8C8680', marginTop: '2px' }}>Qty: {item.quantity || 1} × ₹{Number(item.price).toLocaleString('en-IN')}</p>
                      </div>
                      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', fontWeight: 600, color: DARK, flexShrink: 0 }}>₹{(Number(item.price) * (item.quantity || 1)).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid #E8E4DE', marginTop: '1rem', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: '#8C8680', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total</span>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.15rem', fontWeight: 600, color: GOLD }}>₹{Number(result.total).toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}

            {/* Delivery address */}
            <div style={{ backgroundColor: '#fff', border: '1px solid #E8E4DE', padding: '1.5rem', marginBottom: '1.25rem' }}>
              <p style={{ fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8C8680', marginBottom: '0.85rem', fontWeight: 600 }}>Delivery Address</p>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <FiMapPin size={13} style={{ color: GOLD, marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, color: DARK, marginBottom: '0.25rem' }}>{result.customerName}</p>
                  <p style={{ fontSize: '0.75rem', color: '#4A4642', lineHeight: 1.6 }}>{result.address}</p>
                </div>
              </div>
              {result.customerPhone && (
                <p style={{ fontSize: '0.72rem', color: '#4A4642', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <FiPhone size={11} style={{ color: GOLD }} />{result.customerPhone}
                </p>
              )}
            </div>

            {/* Return option if delivered */}
            {isDelivered && (
              <div style={{ backgroundColor: '#fff', border: `1px solid rgba(201,168,76,0.4)`, padding: '1.25rem 1.5rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FiRotateCcw size={18} style={{ color: GOLD, flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: DARK }}>Not completely satisfied?</p>
                    <p style={{ fontSize: '0.63rem', color: '#6B6560', marginTop: '2px' }}>Initiate a return within 7 days of delivery. Quick and easy process.</p>
                  </div>
                </div>
                <Link to="/return-policy#return-form" style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.63rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: DARK, backgroundColor: GOLD, padding: '0.6rem 1.5rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                  Initiate Return
                </Link>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/products" style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: DARK, backgroundColor: GOLD, padding: '0.9rem 2rem', textDecoration: 'none', border: `1px solid ${GOLD}` }}>
                Continue Shopping
              </Link>
              <a href={`https://wa.me/919084260869?text=Hi%20RAVARI%2C%20I%20need%20help%20with%20my%20order%20RAV${result.id}`} target="_blank" rel="noreferrer"
                style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#16A34A', backgroundColor: 'transparent', padding: '0.9rem 2rem', textDecoration: 'none', border: '1px solid #16A34A' }}>
                WhatsApp Support
              </a>
            </div>
          </>
        )}

        {/* Help note */}
        {!result && (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <p style={{ fontSize: '0.72rem', color: '#8C8680' }}>
              Can't find your order?{' '}
              <a href="https://wa.me/919084260869" target="_blank" rel="noreferrer" style={{ color: GOLD, textDecoration: 'none', fontWeight: 600 }}>Contact us on WhatsApp</a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
