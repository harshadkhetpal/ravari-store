import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import api from '../api/axiosConfig';

const GOLD = '#C9A84C';
const DARK = '#0D0B08';

function getWishlistIds() {
  try { return JSON.parse(localStorage.getItem('ravari_wishlist') || '[]'); } catch { return []; }
}
function setWishlistIds(ids) {
  localStorage.setItem('ravari_wishlist', JSON.stringify(ids));
}

export default function Wishlist() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [ids,      setIds]      = useState(getWishlistIds);
  const dispatch   = useDispatch();
  const navigate   = useNavigate();

  useEffect(() => {
    const saved = getWishlistIds();
    if (saved.length === 0) { setLoading(false); return; }
    api.get('/products').then(res => {
      const all = res.data.products || res.data || [];
      setProducts(all.filter(p => saved.includes(p._id)));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const remove = (id) => {
    const next = ids.filter(x => x !== id);
    setIds(next);
    setWishlistIds(next);
    setProducts(prev => prev.filter(p => p._id !== id));
  };

  const addToCart = (p) => {
    dispatch({ type: 'ADD_TO_CART', payload: { productId: p._id, name: p.name, price: p.salePrice || p.price, image: p.thumbnail, quantity: 1, selectedOptions: {} } });
    navigate('/cart');
  };

  return (
    <div style={{ minHeight: '70vh', backgroundColor: '#FAFAF8' }}>
      {/* Page heading */}
      <div style={{ backgroundColor: DARK, padding: '3.5rem 2rem 3rem', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.55rem', fontWeight: 600, letterSpacing: '0.35em', textTransform: 'uppercase', color: GOLD, marginBottom: '0.75rem' }}>Your Saved Pieces</p>
        <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, color: '#FFFFFF', lineHeight: 1.15 }}>
          Wishlist
        </h1>
        {products.length > 0 && (
          <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.75rem' }}>
            {products.length} {products.length === 1 ? 'item' : 'items'} saved
          </p>
        )}
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem', fontFamily: 'Jost, sans-serif', color: '#8C8680' }}>Loading…</div>

        ) : ids.length === 0 || products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.2" style={{ margin: '0 auto 1.5rem', display: 'block', opacity: 0.5 }}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', fontWeight: 400, color: '#2A2320', marginBottom: '0.75rem' }}>Your wishlist is empty</p>
            <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.75rem', color: '#8C8680', marginBottom: '2rem' }}>Save the pieces you love — click the ♡ icon next to any product name.</p>
            <Link to="/products"
              style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: DARK, border: `1px solid ${DARK}`, padding: '0.85rem 2rem', textDecoration: 'none', display: 'inline-block' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = DARK; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = DARK; }}>
              Explore Collection
            </Link>
          </div>

        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.75rem' }}>
            {products.map(p => {
              const hasDiscount = p.salePrice && p.salePrice < p.price;
              return (
                <div key={p._id} style={{ backgroundColor: '#fff', border: '1px solid #E8E4DE', transition: 'box-shadow 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.07)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>

                  <Link to={`/products/${p.slug}`} style={{ display: 'block', textDecoration: 'none' }}>
                    <div style={{ height: '280px', backgroundColor: '#F4EFE6', overflow: 'hidden' }}>
                      <img src={p.thumbnail || '/placeholder.jpg'} alt={p.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px' }} />
                    </div>
                  </Link>

                  <div style={{ padding: '1rem 1rem 1.25rem' }}>
                    <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.55rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD, marginBottom: '0.3rem' }}>{p.category}</p>

                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <Link to={`/products/${p.slug}`} style={{ textDecoration: 'none', flex: 1 }}>
                        <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.05rem', fontWeight: 500, color: '#1A0F0A', lineHeight: 1.35 }}>{p.name}</h3>
                      </Link>
                      <button onClick={() => remove(p._id)} title="Remove from wishlist"
                        style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0 0 4px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill={GOLD} stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', fontWeight: 600, color: '#1A0F0A' }}>₹{(p.salePrice || p.price)?.toLocaleString('en-IN')}</span>
                        {hasDiscount && <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.72rem', color: '#B8A89A', textDecoration: 'line-through' }}>₹{p.price?.toLocaleString('en-IN')}</span>}
                      </div>
                      <button onClick={() => addToCart(p)}
                        style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#fff', backgroundColor: DARK, border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = GOLD}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = DARK}>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
