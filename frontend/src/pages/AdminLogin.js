import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GOLD = '#C9A84C';
const DARK = '#0D0B08';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('adminToken')) navigate('/admin');
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        navigate('/admin');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: DARK, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'Jost, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.8rem', fontWeight: 600, letterSpacing: '0.5em', color: GOLD, paddingLeft: '0.5em', lineHeight: 1 }}>RAVARI</div>
          <div style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.6rem', letterSpacing: '0.3em', color: 'rgba(201,168,76,0.6)', textTransform: 'uppercase', marginTop: '0.4rem' }}>Admin Panel</div>
        </div>

        {/* Card */}
        <div style={{ backgroundColor: '#1A1510', border: '1px solid rgba(201,168,76,0.2)', padding: '2.5rem', borderRadius: '2px' }}>
          <h2 style={{ color: '#E8D5A3', fontSize: '1.1rem', fontWeight: 500, letterSpacing: '0.1em', marginBottom: '2rem', textTransform: 'uppercase' }}>Sign In</h2>

          {error && (
            <div style={{ backgroundColor: 'rgba(180,50,50,0.15)', border: '1px solid rgba(180,50,50,0.4)', color: '#F87171', padding: '0.75rem 1rem', fontSize: '0.8rem', marginBottom: '1.5rem', letterSpacing: '0.03em' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.8)', marginBottom: '0.5rem' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{ width: '100%', backgroundColor: '#0D0B08', border: '1px solid rgba(201,168,76,0.25)', color: '#E8D5A3', padding: '0.75rem 1rem', fontSize: '0.85rem', outline: 'none', fontFamily: 'Jost, sans-serif', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = GOLD}
                onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.25)'}
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.8)', marginBottom: '0.5rem' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ width: '100%', backgroundColor: '#0D0B08', border: '1px solid rgba(201,168,76,0.25)', color: '#E8D5A3', padding: '0.75rem 1rem', fontSize: '0.85rem', outline: 'none', fontFamily: 'Jost, sans-serif', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = GOLD}
                onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.25)'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', backgroundColor: GOLD, color: DARK, padding: '0.875rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'Jost, sans-serif', transition: 'opacity 0.2s' }}
            >
              {loading ? 'Signing in...' : 'Enter Dashboard'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <a href="/" style={{ color: 'rgba(201,168,76,0.5)', fontSize: '0.7rem', letterSpacing: '0.1em', textDecoration: 'none', fontFamily: 'Jost, sans-serif' }}>← Back to Store</a>
        </div>
      </div>
    </div>
  );
}
