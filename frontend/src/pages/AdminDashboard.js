import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiGrid, FiShoppingBag, FiUsers, FiPackage, FiTag,
  FiLogOut, FiChevronDown, FiChevronUp, FiRefreshCw,
  FiPhone, FiMail, FiMapPin, FiCreditCard, FiAlertCircle,
  FiPlus, FiTrash2, FiEdit2, FiCheck, FiX,
  FiBell, FiTruck, FiDollarSign, FiMessageSquare, FiSlash,
} from 'react-icons/fi';

/* ─── Design tokens ─── */
const GOLD   = '#C9A84C';
const DARK   = '#0D0B08';
const DARK2  = '#1A1510';
const BORDER = 'rgba(201,168,76,0.15)';
const MUTED  = 'rgba(201,168,76,0.5)';

/* ─── Status config ─── */
const STATUS_CFG = {
  pending:          { label: 'Pending',          bg: '#FEF3C7', color: '#92400E' },
  cod_pending:      { label: 'COD Pending',      bg: '#FED7AA', color: '#9A3412' },
  confirmed:        { label: 'Confirmed',        bg: '#E0F2FE', color: '#0369A1' },
  processing:       { label: 'Processing',       bg: '#DBEAFE', color: '#1E40AF' },
  packed:           { label: 'Packed',           bg: '#F3E8FF', color: '#7E22CE' },
  shipped:          { label: 'Shipped',          bg: '#EDE9FE', color: '#5B21B6' },
  out_for_delivery: { label: 'Out for Delivery', bg: '#FFF7ED', color: '#C2410C' },
  delivered:        { label: 'Delivered',        bg: '#D1FAE5', color: '#065F46' },
  cancelled:        { label: 'Cancelled',        bg: '#FEE2E2', color: '#991B1B' },
  returned:         { label: 'Returned',         bg: '#FCE7F3', color: '#9D174D' },
  refunded:         { label: 'Refunded',         bg: '#F0FFF4', color: '#166534' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || { label: status, bg: '#F3F4F6', color: '#374151' };
  return (
    <span style={{ backgroundColor: cfg.bg, color: cfg.color, fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: '2px', whiteSpace: 'nowrap' }}>
      {cfg.label}
    </span>
  );
}

const authHeaders = () => ({ 'Authorization': 'Bearer ' + (localStorage.getItem('adminToken') || ''), 'Content-Type': 'application/json' });

async function apiFetch(path, opts = {}) {
  const res = await fetch('/api' + path, { headers: authHeaders(), ...opts });
  return res.json();
}

/* ─── Sidebar ─── */
const NAV_ITEMS = [
  { key: 'dashboard',      label: 'Dashboard',    Icon: FiGrid },
  { key: 'notifications',  label: 'Notifications',Icon: FiBell },
  { key: 'orders',         label: 'Orders',       Icon: FiShoppingBag },
  { key: 'customers',      label: 'Customers',    Icon: FiUsers },
  { key: 'products',       label: 'Products',     Icon: FiPackage },
  { key: 'coupons',        label: 'Coupons',      Icon: FiTag },
  { key: 'returns',        label: 'Returns',      Icon: FiAlertCircle },
  { key: 'invoices',       label: 'Invoices',     Icon: FiCreditCard },
  { key: 'payments',       label: 'Payments',     Icon: FiDollarSign },
  { key: 'charts',         label: 'Analytics',    Icon: FiRefreshCw },
];

function Sidebar({ active, setActive, onLogout, mobileOpen, setMobileOpen, unreadCount }) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 39 }} />
      )}

      <aside style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: '220px',
        backgroundColor: DARK, borderRight: `1px solid ${BORDER}`,
        display: 'flex', flexDirection: 'column', zIndex: 40,
        transform: mobileOpen ? 'translateX(0)' : undefined,
        transition: 'transform 0.25s',
      }} className="admin-sidebar">

        {/* Logo */}
        <div style={{ padding: '1.75rem 1.5rem', borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.7rem', fontWeight: 600, letterSpacing: '0.4em', color: GOLD, paddingLeft: '0.4em' }}>RAVARI</div>
          <div style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.5rem', letterSpacing: '0.25em', color: MUTED, textTransform: 'uppercase', marginTop: '3px' }}>Admin Panel</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1rem 0', overflowY: 'auto' }}>
          {NAV_ITEMS.map(({ key, label, Icon }) => {
            const isActive = active === key;
            return (
              <button key={key} onClick={() => { setActive(key); setMobileOpen(false); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem 1.5rem', border: 'none', background: 'none', cursor: 'pointer',
                  fontFamily: 'Jost, sans-serif', fontSize: '0.75rem', letterSpacing: '0.12em',
                  textTransform: 'uppercase', fontWeight: isActive ? 600 : 400,
                  color: isActive ? GOLD : 'rgba(255,255,255,0.55)',
                  borderLeft: isActive ? `2px solid ${GOLD}` : '2px solid transparent',
                  backgroundColor: isActive ? 'rgba(201,168,76,0.07)' : 'transparent',
                  transition: 'all 0.15s', position: 'relative',
                }}>
                <Icon size={15} />
                {label}
                {key === 'notifications' && unreadCount > 0 && (
                  <span style={{ marginLeft: 'auto', backgroundColor: '#EF4444', color: '#fff', fontSize: '0.5rem', fontWeight: 700, width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unreadCount}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '1rem', borderTop: `1px solid ${BORDER}` }}>
          <button onClick={onLogout}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 1rem', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171', fontFamily: 'Jost, sans-serif', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 600 }}>
            <FiLogOut size={14} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}

/* ─── Stat card ─── */
function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #E8E4DE', padding: '1.5rem', flex: 1 }}>
      <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8C8680', marginBottom: '0.5rem' }}>{label}</p>
      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 600, color: color || '#1A0F0A', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', color: '#8C8680', marginTop: '0.4rem' }}>{sub}</p>}
    </div>
  );
}

/* ─── Table helpers ─── */
const TH = ({ children, style = {} }) => (
  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontFamily: 'Jost, sans-serif', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8C8680', fontWeight: 600, borderBottom: '1px solid #E8E4DE', whiteSpace: 'nowrap', ...style }}>
    {children}
  </th>
);
const TD = ({ children, style = {} }) => (
  <td style={{ padding: '0.85rem 1rem', fontFamily: 'Jost, sans-serif', fontSize: '0.78rem', color: '#2A2320', borderBottom: '1px solid #F0EDE8', verticalAlign: 'top', ...style }}>
    {children}
  </td>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [active, setActive]       = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading]     = useState(true);

  /* data */
  const [dashStats, setDashStats]     = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [orders, setOrders]           = useState([]);
  const [customers, setCustomers]     = useState([]);
  const [products, setProducts]       = useState([]);
  const [coupons, setCoupons]         = useState([]);

  /* orders UI */
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderFilter, setOrderFilter]     = useState('');

  /* analytics */
  const [analytics, setAnalytics] = useState(null);

  /* returns */
  const [returns, setReturns]           = useState([]);
  const [returnNote, setReturnNote]     = useState({});

  /* notifications */
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);

  /* payments */
  const [payments, setPayments] = useState([]);

  /* tracking edit */
  const [trackingEdit, setTrackingEdit] = useState({});

  /* cancel dialog */
  const [cancelDialog, setCancelDialog] = useState(null); // { orderId, customerName, customerEmail }
  const [cancelMsg, setCancelMsg]       = useState('');

  /* invoice */
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [invoicePrint, setInvoicePrint] = useState(false);

  /* coupon form */
  const emptyCoupon = { code: '', type: 'percent', value: '', minOrder: '', expiresAt: '', active: true };
  const [couponForm, setCouponForm] = useState(emptyCoupon);
  const [couponSaving, setCouponSaving] = useState(false);

  /* stock edit */
  const [editingStock, setEditingStock] = useState({}); // { [productId]: newValue }

  /* ── Auth check ── */
  useEffect(() => {
    if (!localStorage.getItem('adminToken')) { navigate('/admin-login'); return; }
    loadAll();
  }, [navigate]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [dash, ord, cust, prod, coup, anal, ret, notifs, pays] = await Promise.all([
        apiFetch('/admin/dashboard'),
        apiFetch('/admin/orders'),
        apiFetch('/admin/customers'),
        fetch('/api/products?limit=100').then(r => r.json()),
        apiFetch('/coupons'),
        apiFetch('/admin/analytics'),
        apiFetch('/admin/returns'),
        apiFetch('/admin/notifications'),
        apiFetch('/admin/payments'),
      ]);
      setDashStats(dash.stats || null);
      setRecentOrders(dash.recentOrders || []);
      setOrders(ord.orders || []);
      setCustomers(cust.customers || []);
      setProducts(prod.products || prod || []);
      setCoupons(coup.coupons || []);
      setAnalytics(anal);
      setReturns(ret.returns || []);
      setNotifications(notifs.notifications || []);
      setUnreadCount(notifs.unreadCount || 0);
      setPayments(pays.payments || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  const logout = () => { localStorage.removeItem('adminToken'); localStorage.removeItem('adminUser'); navigate('/admin-login'); };

  /* ── Order status update ── */
  const updateOrderStatus = async (id, status) => {
    await apiFetch(`/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    setRecentOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  /* ── Coupons ── */
  const saveCoupon = async () => {
    if (!couponForm.code || !couponForm.value) { alert('Code and value required'); return; }
    setCouponSaving(true);
    try {
      await apiFetch('/admin/coupons', { method: 'POST', body: JSON.stringify({ code: couponForm.code.toUpperCase(), type: couponForm.type, value: parseFloat(couponForm.value), minOrder: parseFloat(couponForm.minOrder || 0), expiresAt: couponForm.expiresAt || null, active: couponForm.active }) });
      setCouponForm(emptyCoupon);
      const c = await apiFetch('/coupons');
      setCoupons(c.coupons || []);
    } catch (e) { alert('Error: ' + e.message); }
    setCouponSaving(false);
  };
  const toggleCoupon = async (c) => {
    await apiFetch(`/admin/coupons/${c.id}`, { method: 'PUT', body: JSON.stringify({ ...c, active: !c.active }) });
    setCoupons(prev => prev.map(x => x.id === c.id ? { ...x, active: !x.active } : x));
  };
  const deleteCoupon = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    await apiFetch(`/admin/coupons/${id}`, { method: 'DELETE' });
    setCoupons(prev => prev.filter(c => c.id !== id));
  };

  /* ── Stock edit ── */
  const saveStock = async (p) => {
    const newStock = parseInt(editingStock[p.id], 10);
    if (isNaN(newStock)) return;
    await apiFetch(`/admin/products/${p.id}`, { method: 'PUT', body: JSON.stringify({ name: p.name, description: p.description, price: p.price, salePrice: p.salePrice, stock: newStock, category: p.category, thumbnail: p.thumbnail, isNew: p.isNew, isFeatured: p.isFeatured }) });
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, stock: newStock } : x));
    setEditingStock(prev => { const n = { ...prev }; delete n[p.id]; return n; });
  };

  /* ── Tracking number save ── */
  const saveTracking = async (orderId) => {
    const tn = trackingEdit[orderId] || '';
    await apiFetch(`/admin/orders/${orderId}/tracking`, { method: 'PUT', body: JSON.stringify({ trackingNumber: tn }) });
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, trackingNumber: tn } : o));
    setTrackingEdit(prev => { const n={...prev}; delete n[orderId]; return n; });
  };

  /* ── Cancel order with message ── */
  const cancelOrder = async () => {
    if (!cancelDialog) return;
    await apiFetch(`/admin/orders/${cancelDialog.orderId}/cancel`, { method: 'POST', body: JSON.stringify({ message: cancelMsg }) });
    setOrders(prev => prev.map(o => o.id === cancelDialog.orderId ? { ...o, status: 'cancelled', cancelMessage: cancelMsg } : o));
    setCancelDialog(null); setCancelMsg('');
  };

  /* ── Mark notification read ── */
  const markNotifRead = async (id) => {
    await apiFetch(`/admin/notifications/${id}/read`, { method: 'PUT' });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: 1 } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };
  const markAllRead = async () => {
    await apiFetch('/admin/notifications/read-all', { method: 'PUT' });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: 1 })));
    setUnreadCount(0);
  };

  /* ── Filtered orders ── */
  const filteredOrders = orderFilter ? orders.filter(o => o.status === orderFilter) : orders;

  /* ── Loading screen ── */
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: DARK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Jost, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: GOLD, letterSpacing: '0.4em', marginBottom: '1.5rem' }}>RAVARI</div>
          <div style={{ width: '32px', height: '32px', border: `2px solid ${BORDER}`, borderTopColor: GOLD, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const totalRevenue = dashStats?.revenue || orders.reduce((s, o) => s + Number(o.total || 0), 0);
  const inputStyle = { fontFamily: 'Jost, sans-serif', fontSize: '0.8rem', padding: '0.6rem 0.85rem', border: '1px solid #D4CFC8', backgroundColor: '#FAFAF8', color: '#2A2320', outline: 'none', width: '100%', boxSizing: 'border-box' };
  const selectStyle = { ...inputStyle, cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8F7F5', fontFamily: 'Jost, sans-serif' }}>
      <style>{`
        .admin-sidebar { display: flex !important; }
        @media (max-width: 768px) {
          .admin-sidebar { transform: translateX(-100%) !important; }
          .admin-sidebar.open { transform: translateX(0) !important; }
          .admin-main { margin-left: 0 !important; }
        }
        .admin-row:hover { background-color: #FAFAF8; }
        .admin-sidebar { display: flex; }
      `}</style>

      <Sidebar active={active} setActive={setActive} onLogout={logout} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} unreadCount={unreadCount} />

      {/* Main content */}
      <div className="admin-main" style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* Top bar */}
        <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #E8E4DE', padding: '0 2rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(true)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: '#6B6560' }} className="admin-hamburger">☰</button>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', fontWeight: 500, color: '#1A0F0A', letterSpacing: '0.05em' }}>
              {NAV_ITEMS.find(n => n.key === active)?.label}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={loadAll} title="Refresh" style={{ background: 'none', border: '1px solid #E8E4DE', padding: '0.4rem 0.6rem', cursor: 'pointer', color: '#8C8680', display: 'flex', alignItems: 'center' }}>
              <FiRefreshCw size={14} />
            </button>
            <div style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.7rem', color: '#8C8680', letterSpacing: '0.05em' }}>
              {(JSON.parse(localStorage.getItem('adminUser') || '{}').email) || 'Admin'}
            </div>
          </div>
        </div>

        <div style={{ padding: '2rem', flex: 1 }}>

          {/* ══════════ DASHBOARD ══════════ */}
          {active === 'dashboard' && (
            <div>
              {/* Stat cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1px', backgroundColor: '#E8E4DE', border: '1px solid #E8E4DE', marginBottom: '2rem' }}>
                <StatCard label="Total Orders" value={dashStats?.orders ?? orders.length} />
                <StatCard label="Total Revenue" value={`₹${Number(totalRevenue).toLocaleString('en-IN')}`} color={GOLD.replace('C', '9')} />
                <StatCard label="Customers" value={dashStats?.customers ?? customers.length} />
                <StatCard label="Products" value={dashStats?.products ?? products.length} />
              </div>

              {/* Status breakdown */}
              {dashStats?.statusMap && Object.keys(dashStats.statusMap).length > 0 && (
                <div style={{ backgroundColor: '#fff', border: '1px solid #E8E4DE', padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
                  <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8C8680', marginBottom: '1rem' }}>Order Status Breakdown</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                    {Object.entries(dashStats.statusMap).map(([s, cnt]) => (
                      <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <StatusBadge status={s} />
                        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', fontWeight: 600, color: '#1A0F0A' }}>{cnt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent orders */}
              <div style={{ backgroundColor: '#fff', border: '1px solid #E8E4DE' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E8E4DE' }}>
                  <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4A4642', fontWeight: 600 }}>Recent Orders</p>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr><TH>Order</TH><TH>Customer</TH><TH>Amount</TH><TH>Payment</TH><TH>Status</TH><TH>Date</TH></tr></thead>
                    <tbody>
                      {recentOrders.length === 0 && (
                        <tr><TD colSpan="6" style={{ textAlign: 'center', color: '#8C8680', padding: '3rem' }}>No orders yet</TD></tr>
                      )}
                      {recentOrders.map(o => (
                        <tr key={o.id} className="admin-row">
                          <TD><span style={{ fontWeight: 600, color: '#1A0F0A' }}>#{o.id}</span></TD>
                          <TD>{o.customerName || '—'}<br /><span style={{ fontSize: '0.65rem', color: '#8C8680' }}>{o.customerEmail}</span></TD>
                          <TD><span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', fontWeight: 600 }}>₹{Number(o.total).toLocaleString('en-IN')}</span></TD>
                          <TD style={{ textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.08em', color: '#6B6560' }}>{o.paymentMethod || '—'}</TD>
                          <TD><StatusBadge status={o.status} /></TD>
                          <TD style={{ fontSize: '0.65rem', color: '#8C8680' }}>{o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : '—'}</TD>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════ ORDERS ══════════ */}
          {active === 'orders' && (
            <div>
              {/* Filter bar */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', color: '#8C8680', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Filter:</span>
                {['', 'pending', 'cod_pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned', 'refunded'].map(s => (
                  <button key={s || 'all'} onClick={() => setOrderFilter(s)}
                    style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.3rem 0.85rem', border: `1px solid ${orderFilter === s ? '#1A0F0A' : '#D4CFC8'}`, backgroundColor: orderFilter === s ? '#1A0F0A' : 'transparent', color: orderFilter === s ? '#fff' : '#6B6560', cursor: 'pointer' }}>
                    {STATUS_CFG[s]?.label || 'All'} {s ? `(${orders.filter(o => o.status === s).length})` : `(${orders.length})`}
                  </button>
                ))}
              </div>

              <div style={{ backgroundColor: '#fff', border: '1px solid #E8E4DE' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <TH></TH>
                        <TH>Order ID</TH>
                        <TH>Customer</TH>
                        <TH>Phone</TH>
                        <TH>Items</TH>
                        <TH>Amount</TH>
                        <TH>Payment</TH>
                        <TH>Status</TH>
                        <TH>Tracking</TH>
                        <TH>Date</TH>
                        <TH>Actions</TH>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.length === 0 && (
                        <tr><td colSpan="11" style={{ textAlign: 'center', color: '#8C8680', padding: '3rem', fontFamily: 'Jost, sans-serif', fontSize: '0.8rem' }}>No orders found</td></tr>
                      )}
                      {filteredOrders.map(o => (
                        <React.Fragment key={o.id}>
                          <tr className="admin-row" style={{ cursor: 'pointer' }} onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}>
                            <TD style={{ width: '32px', color: '#8C8680' }}>
                              {expandedOrder === o.id ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                            </TD>
                            <TD><span style={{ fontWeight: 600 }}>RAV{o.id}</span></TD>
                            <TD>
                              <span style={{ fontWeight: 500 }}>{o.customerName || '—'}</span><br />
                              <span style={{ fontSize: '0.62rem', color: '#8C8680' }}>{o.customerEmail}</span>
                            </TD>
                            <TD style={{ fontSize: '0.72rem', color: '#4A4642', whiteSpace: 'nowrap' }}>{o.customerPhone || '—'}</TD>
                            <TD>{Array.isArray(o.items) ? o.items.length : 0} item{o.items?.length !== 1 ? 's' : ''}</TD>
                            <TD><span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', fontWeight: 600 }}>₹{Number(o.total).toLocaleString('en-IN')}</span></TD>
                            <TD style={{ textTransform: 'uppercase', fontSize: '0.62rem', letterSpacing: '0.06em', color: '#6B6560' }}>{o.paymentMethod || '—'}</TD>
                            <TD onClick={e => e.stopPropagation()}>
                              <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)}
                                style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.62rem', padding: '0.3rem 0.5rem', border: '1px solid #D4CFC8', backgroundColor: '#FAFAF8', cursor: 'pointer', outline: 'none' }}>
                                {Object.keys(STATUS_CFG).map(s => <option key={s} value={s}>{STATUS_CFG[s].label}</option>)}
                              </select>
                            </TD>
                            <TD onClick={e => e.stopPropagation()} style={{ minWidth: '140px' }}>
                              {trackingEdit[o.id] !== undefined ? (
                                <div style={{ display: 'flex', gap: '0.3rem' }}>
                                  <input value={trackingEdit[o.id]} onChange={e => setTrackingEdit(prev => ({ ...prev, [o.id]: e.target.value }))}
                                    style={{ width: '90px', fontFamily: 'Jost, sans-serif', fontSize: '0.62rem', padding: '0.25rem 0.4rem', border: '1px solid #C9A84C', outline: 'none' }} />
                                  <button onClick={() => saveTracking(o.id)} style={{ background: 'none', border: 'none', color: '#16A34A', cursor: 'pointer' }}><FiCheck size={12} /></button>
                                  <button onClick={() => setTrackingEdit(prev => { const n={...prev}; delete n[o.id]; return n; })} style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer' }}><FiX size={12} /></button>
                                </div>
                              ) : (
                                <button onClick={() => setTrackingEdit(prev => ({ ...prev, [o.id]: o.trackingNumber || '' }))}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.62rem', color: o.trackingNumber ? '#0369A1' : '#8C8680', fontFamily: 'Jost, sans-serif' }}>
                                  <FiTruck size={11} />
                                  {o.trackingNumber || 'Add tracking'}
                                </button>
                              )}
                            </TD>
                            <TD style={{ fontSize: '0.62rem', color: '#8C8680', whiteSpace: 'nowrap' }}>
                              {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                            </TD>
                            <TD onClick={e => e.stopPropagation()}>
                              <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                                {o.status !== 'cancelled' && (
                                  <button title="Cancel Order" onClick={() => { setCancelDialog({ orderId: o.id, customerName: o.customerName, customerEmail: o.customerEmail, customerPhone: o.customerPhone }); setCancelMsg(`Dear ${o.customerName || 'Customer'},\n\nWe regret to inform you that your RAVARI order #RAV${o.id} has been cancelled due to temporary unavailability of the product. We sincerely apologise for the inconvenience.\n\nIf you made an online payment, a full refund will be processed within 5–7 business days.\n\nThank you for your understanding.\n\nWarm regards,\nTeam RAVARI`); }}
                                    style={{ background: 'none', border: '1px solid #FCA5A5', color: '#DC2626', padding: '0.25rem 0.4rem', cursor: 'pointer', fontSize: '0.6rem', fontFamily: 'Jost, sans-serif', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                    <FiSlash size={11} /> Cancel
                                  </button>
                                )}
                              </div>
                            </TD>
                          </tr>

                          {/* Expanded detail row */}
                          {expandedOrder === o.id && (
                            <tr>
                              <td colSpan="11" style={{ backgroundColor: '#FAFAF8', padding: '0 1rem 1.25rem 3rem', borderBottom: '2px solid #E8E4DE' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem', paddingTop: '1rem' }}>

                                  {/* Items */}
                                  <div>
                                    <p style={{ fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8C8680', marginBottom: '0.6rem' }}>Ordered Items</p>
                                    {(Array.isArray(o.items) ? o.items : []).map((item, i) => (
                                      <div key={i} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
                                        {item.image && <img src={item.image} alt="" style={{ width: '40px', height: '40px', objectFit: 'contain', border: '1px solid #E8E4DE', flexShrink: 0 }} />}
                                        <div>
                                          <p style={{ fontSize: '0.75rem', fontWeight: 500, color: '#1A0F0A', lineHeight: 1.3 }}>{item.name || item.productId}</p>
                                          <p style={{ fontSize: '0.65rem', color: '#8C8680' }}>Qty: {item.quantity || 1} × ₹{Number(item.price).toLocaleString('en-IN')}</p>
                                          {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                            <p style={{ fontSize: '0.62rem', color: '#C9A84C' }}>{Object.entries(item.selectedOptions).map(([k,v]) => `${k}: ${v}`).join(', ')}</p>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                    {(!o.items || o.items.length === 0) && <p style={{ fontSize: '0.75rem', color: '#8C8680' }}>No items</p>}
                                  </div>

                                  {/* Customer info */}
                                  <div>
                                    <p style={{ fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8C8680', marginBottom: '0.6rem' }}>Customer</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                      <span style={{ fontSize: '0.78rem', fontWeight: 500, color: '#1A0F0A' }}>{o.customerName || '—'}</span>
                                      {o.customerEmail && <span style={{ fontSize: '0.72rem', color: '#6B6560', display: 'flex', alignItems: 'center', gap: '0.35rem' }}><FiMail size={11} />{o.customerEmail}</span>}
                                      {o.customerPhone && <span style={{ fontSize: '0.72rem', color: '#6B6560', display: 'flex', alignItems: 'center', gap: '0.35rem' }}><FiPhone size={11} />{o.customerPhone}</span>}
                                    </div>
                                  </div>

                                  {/* Address */}
                                  <div>
                                    <p style={{ fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8C8680', marginBottom: '0.6rem' }}>Delivery Address</p>
                                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
                                      <FiMapPin size={11} style={{ color: '#C9A84C', marginTop: '2px', flexShrink: 0 }} />
                                      <span style={{ fontSize: '0.75rem', color: '#4A4642', lineHeight: 1.5 }}>{o.address || '—'}</span>
                                    </div>
                                  </div>

                                  {/* Order summary */}
                                  <div>
                                    <p style={{ fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8C8680', marginBottom: '0.6rem' }}>Order Summary</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#6B6560' }}>
                                        <span>Subtotal</span><span>₹{Number(o.subtotal || 0).toLocaleString('en-IN')}</span>
                                      </div>
                                      {Number(o.discount) > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#6B6560' }}>
                                          <span>Discount {o.couponCode ? `(${o.couponCode})` : ''}</span>
                                          <span style={{ color: '#16A34A' }}>−₹{Number(o.discount).toLocaleString('en-IN')}</span>
                                        </div>
                                      )}
                                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, color: '#1A0F0A', borderTop: '1px solid #E8E4DE', paddingTop: '0.4rem', marginTop: '0.2rem' }}>
                                        <span>Total</span>
                                        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem' }}>₹{Number(o.total).toLocaleString('en-IN')}</span>
                                      </div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem', fontSize: '0.65rem', color: '#6B6560' }}>
                                        <FiCreditCard size={11} />
                                        <span style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>{o.paymentMethod || 'cod'}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════ NOTIFICATIONS ══════════ */}
          {active === 'notifications' && (
            <div>
              <div style={{ backgroundColor: '#fff', border: '1px solid #E8E4DE', marginBottom: '1.5rem' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E8E4DE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD, fontWeight: 600, marginBottom: '0.2rem' }}>Admin</p>
                    <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.35rem', fontWeight: 600, color: '#2A2320' }}>Notifications Center</h2>
                  </div>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead}
                      style={{ fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, backgroundColor: GOLD, color: '#0D0B08', padding: '0.5rem 1.25rem', border: 'none', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
                      Mark All Read ({unreadCount})
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <div style={{ padding: '3rem', textAlign: 'center', color: '#8C8680', fontFamily: 'Jost, sans-serif', fontSize: '0.8rem' }}>
                    No notifications yet.
                  </div>
                ) : (
                  <div>
                    {notifications.map(n => (
                      <div key={n.id} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F0EDE8', display: 'flex', gap: '1rem', alignItems: 'flex-start', backgroundColor: n.isRead ? '#fff' : '#FFFDF7' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: n.isRead ? '#D1D5DB' : '#C9A84C', marginTop: '5px', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                            <div>
                              <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.75rem', fontWeight: 600, color: '#2A2320', marginBottom: '0.2rem' }}>{n.title}</p>
                              <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.72rem', color: '#4A4642' }}>{n.message}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                              <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.6rem', color: '#8C8680', whiteSpace: 'nowrap' }}>
                                {new Date(n.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {!n.isRead && (
                                <button onClick={() => markNotifRead(n.id)}
                                  style={{ fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, color: GOLD, background: 'none', border: `1px solid ${GOLD}`, padding: '0.2rem 0.5rem', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
                                  Mark Read
                                </button>
                              )}
                            </div>
                          </div>
                          {n.orderId && (
                            <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.6rem', color: '#8C8680', marginTop: '0.3rem' }}>Order: RAV{n.orderId}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════ CUSTOMERS ══════════ */}
          {active === 'customers' && (
            <div>
              <div style={{ backgroundColor: '#fff', border: '1px solid #E8E4DE' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E8E4DE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4A4642', fontWeight: 600 }}>All Customers ({customers.length})</p>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <TH>#</TH>
                        <TH>Name</TH>
                        <TH>Email</TH>
                        <TH>Phone</TH>
                        <TH>Orders</TH>
                        <TH>Total Spent</TH>
                        <TH>Last Order</TH>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.length === 0 && (
                        <tr><td colSpan="7" style={{ textAlign: 'center', color: '#8C8680', padding: '3rem', fontFamily: 'Jost, sans-serif', fontSize: '0.8rem' }}>No customers yet — they appear here after placing an order</td></tr>
                      )}
                      {customers.map((c, i) => (
                        <tr key={c.email} className="admin-row">
                          <TD style={{ color: '#8C8680' }}>{i + 1}</TD>
                          <TD><span style={{ fontWeight: 500, color: '#1A0F0A' }}>{c.name || '—'}</span></TD>
                          <TD style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#4A4642' }}><FiMail size={11} style={{ flexShrink: 0 }} />{c.email}</TD>
                          <TD style={{ color: '#4A4642' }}>{c.phone ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><FiPhone size={11} />{c.phone}</span> : '—'}</TD>
                          <TD>
                            <span style={{ backgroundColor: '#F0EDE8', color: '#4A4642', fontSize: '0.65rem', fontWeight: 600, padding: '2px 8px' }}>{c.orderCount}</span>
                          </TD>
                          <TD><span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', fontWeight: 600, color: '#1A0F0A' }}>₹{Number(c.totalSpent).toLocaleString('en-IN')}</span></TD>
                          <TD style={{ fontSize: '0.68rem', color: '#8C8680' }}>{c.lastOrder ? new Date(c.lastOrder).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</TD>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════ PRODUCTS ══════════ */}
          {active === 'products' && (
            <div>
              <div style={{ backgroundColor: '#fff', border: '1px solid #E8E4DE' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E8E4DE' }}>
                  <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4A4642', fontWeight: 600 }}>All Products ({products.length})</p>
                  <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', color: '#8C8680', marginTop: '0.25rem' }}>Click stock number to edit. New products are added via server.js.</p>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <TH>Image</TH>
                        <TH>Product</TH>
                        <TH>Category</TH>
                        <TH>MRP</TH>
                        <TH>Sale Price</TH>
                        <TH>Stock</TH>
                        <TH>Badges</TH>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p.id} className="admin-row">
                          <TD>
                            {p.thumbnail ? (
                              <img src={p.thumbnail} alt={p.name} style={{ width: '52px', height: '52px', objectFit: 'contain', border: '1px solid #E8E4DE', backgroundColor: '#FAFAF8' }} />
                            ) : (
                              <div style={{ width: '52px', height: '52px', backgroundColor: '#F4EFE6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C9A84C', fontSize: '0.6rem' }}>IMG</div>
                            )}
                          </TD>
                          <TD>
                            <a href={`/products/${p.slug}`} target="_blank" rel="noreferrer" style={{ fontWeight: 500, color: '#1A0F0A', textDecoration: 'none', fontSize: '0.78rem', lineHeight: 1.4 }}
                              onMouseEnter={e => e.target.style.color = GOLD} onMouseLeave={e => e.target.style.color = '#1A0F0A'}>
                              {p.name.length > 55 ? p.name.slice(0, 55) + '…' : p.name}
                            </a>
                            {p.variants?.length > 0 && (
                              <p style={{ fontSize: '0.6rem', color: '#C9A84C', marginTop: '2px', letterSpacing: '0.05em' }}>{p.variants.length} variants ({p.variantLabel})</p>
                            )}
                          </TD>
                          <TD style={{ fontSize: '0.7rem', color: '#6B6560' }}>{p.category}</TD>
                          <TD style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.78rem', color: '#8C8680', textDecoration: p.salePrice ? 'line-through' : 'none' }}>₹{Number(p.price).toLocaleString('en-IN')}</TD>
                          <TD>
                            {p.salePrice ? (
                              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', fontWeight: 600, color: '#1A0F0A' }}>₹{Number(p.salePrice).toLocaleString('en-IN')}</span>
                            ) : '—'}
                          </TD>
                          <TD>
                            {editingStock[p.id] !== undefined ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <input type="number" min="0" value={editingStock[p.id]}
                                  onChange={e => setEditingStock(prev => ({ ...prev, [p.id]: e.target.value }))}
                                  style={{ width: '60px', padding: '0.3rem', border: '1px solid #C9A84C', fontSize: '0.78rem', outline: 'none', fontFamily: 'Jost, sans-serif' }} />
                                <button onClick={() => saveStock(p)} style={{ background: 'none', border: 'none', color: '#16A34A', cursor: 'pointer' }}><FiCheck size={14} /></button>
                                <button onClick={() => setEditingStock(prev => { const n = { ...prev }; delete n[p.id]; return n; })} style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer' }}><FiX size={14} /></button>
                              </div>
                            ) : (
                              <button onClick={() => setEditingStock(prev => ({ ...prev, [p.id]: p.stock }))}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: 0 }}>
                                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', fontWeight: 600, color: p.stock < 5 ? '#DC2626' : '#1A0F0A' }}>{p.stock}</span>
                                <FiEdit2 size={11} style={{ color: '#8C8680' }} />
                              </button>
                            )}
                          </TD>
                          <TD>
                            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                              {p.isNew && <span style={{ backgroundColor: '#1A0F0A', color: '#E8D5A3', fontSize: '0.5rem', letterSpacing: '0.12em', padding: '2px 7px', fontWeight: 600 }}>NEW</span>}
                              {p.isFeatured && <span style={{ backgroundColor: '#F0EDE8', color: '#6B3A2A', fontSize: '0.5rem', letterSpacing: '0.12em', padding: '2px 7px', fontWeight: 600 }}>FEATURED</span>}
                            </div>
                          </TD>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════ COUPONS ══════════ */}
          {active === 'coupons' && (
            <div>
              {/* Create coupon form */}
              <div style={{ backgroundColor: '#fff', border: '1px solid #E8E4DE', marginBottom: '1.5rem' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E8E4DE' }}>
                  <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4A4642', fontWeight: 600 }}>Create Coupon</p>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.58rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8C8680', marginBottom: '0.4rem' }}>Code *</label>
                      <input type="text" placeholder="SAVE20" value={couponForm.code} onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.58rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8C8680', marginBottom: '0.4rem' }}>Type</label>
                      <select value={couponForm.type} onChange={e => setCouponForm({ ...couponForm, type: e.target.value })} style={selectStyle}>
                        <option value="percent">Percentage (%)</option>
                        <option value="flat">Flat (₹)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.58rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8C8680', marginBottom: '0.4rem' }}>Value *</label>
                      <input type="number" placeholder={couponForm.type === 'percent' ? '10 (%)' : '500 (₹)'} value={couponForm.value} onChange={e => setCouponForm({ ...couponForm, value: e.target.value })} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.58rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8C8680', marginBottom: '0.4rem' }}>Min Order (₹)</label>
                      <input type="number" placeholder="0" value={couponForm.minOrder} onChange={e => setCouponForm({ ...couponForm, minOrder: e.target.value })} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.58rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8C8680', marginBottom: '0.4rem' }}>Expiry Date</label>
                      <input type="date" value={couponForm.expiresAt} onChange={e => setCouponForm({ ...couponForm, expiresAt: e.target.value })} style={inputStyle} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.1rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontFamily: 'Jost, sans-serif', fontSize: '0.72rem', color: '#4A4642' }}>
                        <input type="checkbox" checked={couponForm.active} onChange={e => setCouponForm({ ...couponForm, active: e.target.checked })} />
                        Active
                      </label>
                    </div>
                  </div>
                  <button onClick={saveCoupon} disabled={couponSaving}
                    style={{ backgroundColor: GOLD, color: DARK, padding: '0.65rem 2rem', border: 'none', cursor: couponSaving ? 'not-allowed' : 'pointer', fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, opacity: couponSaving ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FiPlus size={14} /> {couponSaving ? 'Creating…' : 'Create Coupon'}
                  </button>
                </div>
              </div>

              {/* Coupon list */}
              <div style={{ backgroundColor: '#fff', border: '1px solid #E8E4DE' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <TH>Code</TH>
                        <TH>Discount</TH>
                        <TH>Min Order</TH>
                        <TH>Expires</TH>
                        <TH>Used</TH>
                        <TH>Status</TH>
                        <TH>Actions</TH>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.length === 0 && (
                        <tr><td colSpan="7" style={{ textAlign: 'center', color: '#8C8680', padding: '3rem', fontFamily: 'Jost, sans-serif', fontSize: '0.8rem' }}>No coupons yet</td></tr>
                      )}
                      {coupons.map(c => (
                        <tr key={c.id} className="admin-row">
                          <TD><span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.05em', color: '#1A0F0A' }}>{c.code}</span></TD>
                          <TD style={{ fontWeight: 600 }}>{c.type === 'flat' ? `₹${Number(c.value).toLocaleString('en-IN')}` : `${c.value}%`}</TD>
                          <TD>{c.minOrder > 0 ? `₹${Number(c.minOrder).toLocaleString('en-IN')}` : '—'}</TD>
                          <TD style={{ fontSize: '0.68rem', color: '#8C8680' }}>{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('en-IN') : 'No expiry'}</TD>
                          <TD>{c.usedCount || 0}</TD>
                          <TD>
                            <button onClick={() => toggleCoupon(c)}
                              style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 10px', border: 'none', cursor: 'pointer', backgroundColor: c.active ? '#D1FAE5' : '#F3F4F6', color: c.active ? '#065F46' : '#6B7280' }}>
                              {c.active ? 'Active' : 'Inactive'}
                            </button>
                          </TD>
                          <TD>
                            <button onClick={() => deleteCoupon(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '0.3rem', fontFamily: 'Jost, sans-serif', fontSize: '0.7rem' }}>
                              <FiTrash2 size={13} /> Delete
                            </button>
                          </TD>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════ RETURNS ══════════ */}
          {active === 'returns' && (
            <div>
              <div style={{ backgroundColor: '#fff', border: '1px solid #E8E4DE' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E8E4DE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4A4642', fontWeight: 600 }}>Return Requests ({returns.length})</p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['pending','approved','rejected','completed'].map(s => (
                      <span key={s} style={{ fontSize: '0.58rem', padding: '2px 8px', backgroundColor: s==='pending'?'#FEF3C7':s==='approved'?'#D1FAE5':s==='rejected'?'#FEE2E2':'#F3F4F6', color: s==='pending'?'#92400E':s==='approved'?'#065F46':s==='rejected'?'#991B1B':'#374151', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        {s}: {returns.filter(r=>r.status===s).length}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr><TH>#</TH><TH>Order ID</TH><TH>Customer</TH><TH>Reason</TH><TH>Description</TH><TH>Date</TH><TH>Status</TH><TH>Admin Note</TH><TH>Action</TH></tr></thead>
                    <tbody>
                      {returns.length === 0 && (
                        <tr><td colSpan="9" style={{ textAlign: 'center', color: '#8C8680', padding: '3rem', fontFamily: 'Jost, sans-serif', fontSize: '0.8rem' }}>No return requests yet</td></tr>
                      )}
                      {returns.map(r => (
                        <tr key={r.id} className="admin-row">
                          <TD style={{ color: '#8C8680' }}>{r.id}</TD>
                          <TD><span style={{ fontWeight: 600, color: '#1A0F0A' }}>#{r.orderId}</span></TD>
                          <TD>
                            <span style={{ fontWeight: 500 }}>{r.customerName || '—'}</span><br />
                            <span style={{ fontSize: '0.62rem', color: '#8C8680' }}>{r.customerEmail}</span><br />
                            {r.customerPhone && <span style={{ fontSize: '0.62rem', color: '#8C8680' }}>{r.customerPhone}</span>}
                          </TD>
                          <TD style={{ fontSize: '0.75rem', maxWidth: '160px' }}>{r.reason}</TD>
                          <TD style={{ fontSize: '0.72rem', color: '#6B6560', maxWidth: '200px' }}>{r.description || '—'}</TD>
                          <TD style={{ fontSize: '0.65rem', color: '#8C8680', whiteSpace: 'nowrap' }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : '—'}</TD>
                          <TD>
                            <select value={r.status} onChange={async e => {
                              const status = e.target.value;
                              await apiFetch(`/admin/returns/${r.id}/status`, { method: 'PUT', body: JSON.stringify({ status, adminNote: returnNote[r.id] || r.adminNote || '' }) });
                              setReturns(prev => prev.map(x => x.id === r.id ? { ...x, status } : x));
                            }} style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', padding: '0.3rem 0.5rem', border: '1px solid #D4CFC8', backgroundColor: '#FAFAF8', cursor: 'pointer', outline: 'none' }}>
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="rejected">Rejected</option>
                              <option value="completed">Completed</option>
                            </select>
                          </TD>
                          <TD>
                            <input type="text" placeholder="Add note…" value={returnNote[r.id] ?? (r.adminNote || '')}
                              onChange={e => setReturnNote(prev => ({ ...prev, [r.id]: e.target.value }))}
                              style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.7rem', padding: '0.3rem 0.5rem', border: '1px solid #D4CFC8', width: '130px', outline: 'none' }} />
                          </TD>
                          <TD>
                            <button onClick={async () => {
                              await apiFetch(`/admin/returns/${r.id}/status`, { method: 'PUT', body: JSON.stringify({ status: r.status, adminNote: returnNote[r.id] || r.adminNote || '' }) });
                              setReturns(prev => prev.map(x => x.id === r.id ? { ...x, adminNote: returnNote[r.id] || x.adminNote } : x));
                            }} style={{ background: 'none', border: '1px solid #C9A84C', color: '#C9A84C', padding: '0.25rem 0.6rem', cursor: 'pointer', fontSize: '0.65rem', fontFamily: 'Jost, sans-serif' }}>Save</button>
                          </TD>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════ PAYMENTS ══════════ */}
          {active === 'payments' && (
            <div>
              <div style={{ backgroundColor: '#fff', border: '1px solid #E8E4DE' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E8E4DE' }}>
                  <p style={{ fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD, fontWeight: 600, marginBottom: '0.2rem' }}>Finance</p>
                  <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.35rem', fontWeight: 600, color: '#2A2320' }}>Payment Management</h2>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Jost, sans-serif', fontSize: '0.72rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#FAFAF8', borderBottom: '2px solid #E8E4DE' }}>
                        {['Order ID', 'Customer', 'Phone', 'Amount', 'Payment Method', 'Payment Status', 'Order Status', 'Date'].map(h => (
                          <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.58rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8C8680', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(payments || []).map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #F0EDE8' }}>
                          <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#2A2320', whiteSpace: 'nowrap' }}>RAV{p.id}</td>
                          <td style={{ padding: '0.85rem 1rem', color: '#4A4642' }}>{p.customerName}</td>
                          <td style={{ padding: '0.85rem 1rem', color: '#6B7280' }}>{p.customerPhone || '—'}</td>
                          <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#2A2320' }}>₹{(p.totalAmount || 0).toLocaleString('en-IN')}</td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 8px', backgroundColor: p.paymentMethod === 'cod' ? '#FFF7ED' : '#EDE9FE', color: p.paymentMethod === 'cod' ? '#C2410C' : '#5B21B6', borderRadius: '2px' }}>
                              {p.paymentMethod === 'cod' ? 'COD' : (p.paymentMethod || '—').toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            {(() => {
                              const st = p.status === 'delivered' ? 'paid' : p.status === 'cancelled' ? 'refunded' : p.status === 'refunded' ? 'refunded' : 'pending';
                              const cfg = { paid: { bg: '#D1FAE5', c: '#065F46' }, pending: { bg: '#FEF3C7', c: '#92400E' }, refunded: { bg: '#FCE7F3', c: '#9D174D' } }[st] || { bg: '#F3F4F6', c: '#374151' };
                              return <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 8px', backgroundColor: cfg.bg, color: cfg.c, borderRadius: '2px' }}>{st}</span>;
                            })()}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}><StatusBadge status={p.status} /></td>
                          <td style={{ padding: '0.85rem 1rem', color: '#8C8680', fontSize: '0.65rem', whiteSpace: 'nowrap' }}>
                            {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                          </td>
                        </tr>
                      ))}
                      {(!payments || payments.length === 0) && (
                        <tr><td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: '#8C8680', fontFamily: 'Jost, sans-serif' }}>No payment records found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════ INVOICES ══════════ */}
          {active === 'invoices' && (
            <div>
              <div style={{ backgroundColor: '#fff', border: '1px solid #E8E4DE', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4A4642', fontWeight: 600, marginBottom: '1rem' }}>Generate Invoice</p>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <select onChange={e => { const o = orders.find(x => String(x.id) === e.target.value); setInvoiceOrder(o || null); setInvoicePrint(false); }}
                    style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.8rem', padding: '0.65rem 1rem', border: '1px solid #D4CFC8', backgroundColor: '#FAFAF8', cursor: 'pointer', outline: 'none', minWidth: '220px' }}>
                    <option value="">Select an Order…</option>
                    {orders.map(o => <option key={o.id} value={o.id}>#{o.id} — {o.customerName || '—'} — ₹{Number(o.total).toLocaleString('en-IN')}</option>)}
                  </select>
                  {invoiceOrder && (
                    <button onClick={() => { setInvoicePrint(true); setTimeout(() => window.print(), 400); }}
                      style={{ backgroundColor: GOLD, color: DARK, padding: '0.65rem 1.5rem', border: 'none', cursor: 'pointer', fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700 }}>
                      Print / Save as PDF
                    </button>
                  )}
                </div>
              </div>

              {invoiceOrder && (() => {
                const o = invoiceOrder;
                const invNum = `RAV-${new Date(o.createdAt || Date.now()).getFullYear()}-${String(o.id).padStart(4,'0')}`;
                const items = Array.isArray(o.items) ? o.items : [];
                const qrData = encodeURIComponent(`RAVARI Invoice ${invNum} | Order #${o.id} | ${o.customerName} | ₹${o.total}`);
                return (
                  <div id="invoice-print-area">
                    <style>{`
                      @media print {
                        body > * { display: none !important; }
                        #invoice-print-area { display: block !important; }
                        #invoice-print-area .no-print { display: none !important; }
                      }
                    `}</style>

                    {/* CUSTOMER COPY */}
                    {['Customer Copy', 'Company Copy'].map((copyLabel, ci) => (
                      <div key={ci} style={{ backgroundColor: '#fff', border: '1px solid #E8E4DE', padding: '2.5rem', marginBottom: '1.5rem', maxWidth: '780px', fontFamily: 'Jost, sans-serif', position: 'relative' }}>
                        {/* Watermark copy label */}
                        <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: ci === 0 ? '#C9A84C' : '#8C8680', fontWeight: 700, border: `1px solid ${ci===0?'#C9A84C':'#D4CFC8'}`, padding: '3px 10px' }}>{copyLabel}</div>

                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '2px solid #0D0B08' }}>
                          <div>
                            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 600, letterSpacing: '0.3em', color: '#0D0B08' }}>RAVARI</div>
                            <div style={{ fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A84C', marginTop: '2px' }}>Handcrafted Leather Goods</div>
                            <div style={{ fontSize: '0.68rem', color: '#6B6560', marginTop: '0.75rem', lineHeight: 1.7 }}>
                              ravari.store@gmail.com<br />
                              +91 90842 60869<br />
                              ravari.in
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.58rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8C8680', marginBottom: '0.3rem' }}>Tax Invoice</div>
                            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontWeight: 600, color: '#0D0B08' }}>{invNum}</div>
                            <div style={{ fontSize: '0.68rem', color: '#6B6560', marginTop: '0.4rem' }}>
                              Date: {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}<br />
                              Payment: <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{o.paymentMethod || 'COD'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Bill To */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.75rem' }}>
                          <div>
                            <div style={{ fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8C8680', marginBottom: '0.5rem', fontWeight: 600 }}>Bill To</div>
                            <div style={{ fontWeight: 600, color: '#0D0B08', fontSize: '0.88rem' }}>{o.customerName || '—'}</div>
                            <div style={{ fontSize: '0.72rem', color: '#4A4642', marginTop: '0.3rem', lineHeight: 1.7 }}>
                              {o.customerEmail && <div>{o.customerEmail}</div>}
                              {o.customerPhone && <div>{o.customerPhone}</div>}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8C8680', marginBottom: '0.5rem', fontWeight: 600 }}>Ship To</div>
                            <div style={{ fontSize: '0.72rem', color: '#4A4642', lineHeight: 1.7 }}>{o.address || '—'}</div>
                          </div>
                        </div>

                        {/* Items table */}
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.78rem' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#0D0B08', color: '#C9A84C' }}>
                              <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>Item</th>
                              <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center', fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>Qty</th>
                              <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>Unit Price</th>
                              <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.length === 0 && (
                              <tr><td colSpan="4" style={{ padding: '1rem', textAlign: 'center', color: '#8C8680', fontSize: '0.75rem' }}>No items</td></tr>
                            )}
                            {items.map((item, i) => (
                              <tr key={i} style={{ borderBottom: '1px solid #F0EDE8' }}>
                                <td style={{ padding: '0.65rem 0.75rem', color: '#2A2320' }}>
                                  {item.name || item.productId}
                                  {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                    <span style={{ fontSize: '0.65rem', color: '#8C8680', marginLeft: '0.5rem' }}>({Object.entries(item.selectedOptions).map(([k,v])=>`${k}: ${v}`).join(', ')})</span>
                                  )}
                                </td>
                                <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', color: '#4A4642' }}>{item.quantity || 1}</td>
                                <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', color: '#4A4642' }}>₹{Number(item.price || 0).toLocaleString('en-IN')}</td>
                                <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', fontWeight: 600, color: '#0D0B08' }}>₹{(Number(item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {/* Totals + QR */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '2rem' }}>
                          {/* QR code */}
                          <div style={{ textAlign: 'center' }}>
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${qrData}`} alt="QR" style={{ width: '90px', height: '90px', display: 'block' }} />
                            <div style={{ fontSize: '0.5rem', color: '#8C8680', marginTop: '0.3rem', letterSpacing: '0.08em' }}>Scan to verify</div>
                          </div>

                          {/* Totals */}
                          <div style={{ minWidth: '220px' }}>
                            {[
                              { label: 'Subtotal', val: `₹${Number(o.subtotal||0).toLocaleString('en-IN')}` },
                              ...(Number(o.discount)>0 ? [{ label: `Discount${o.couponCode?` (${o.couponCode})`:''}`, val: `−₹${Number(o.discount).toLocaleString('en-IN')}`, red: true }] : []),
                              { label: 'Shipping', val: Number(o.subtotal||0)>=5000?'FREE':'₹200' },
                            ].map(({ label, val, red }) => (
                              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: red?'#DC2626':'#6B6560', padding: '0.25rem 0', borderBottom: '1px solid #F0EDE8' }}>
                                <span>{label}</span><span>{val}</span>
                              </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#0D0B08', color: '#C9A84C', padding: '0.6rem 0.75rem', marginTop: '0.5rem', fontWeight: 700 }}>
                              <span style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Total</span>
                              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem' }}>₹{Number(o.total).toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Footer */}
                        <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #E8E4DE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontSize: '0.62rem', color: '#8C8680', lineHeight: 1.7 }}>
                            <strong style={{ color: '#4A4642' }}>Return Policy:</strong> 7 days from delivery. Visit ravari.in/return-policy<br />
                            This is a computer-generated invoice. No signature required.
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8C8680' }}>Status</div>
                            <StatusBadge status={o.status} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ══════════ CHARTS / ANALYTICS ══════════ */}
          {active === 'charts' && (() => {
            const daily = analytics?.daily || [];
            const monthly = analytics?.monthly || [];
            const statusBD = analytics?.statusBreakdown || [];
            const topP = analytics?.topProducts || [];
            const maxRev = Math.max(...daily.map(d => Number(d.revenue)), 1);
            const maxMon = Math.max(...monthly.map(d => Number(d.revenue)), 1);

            return (
              <div>
                {/* Revenue bar chart - daily */}
                <div style={{ backgroundColor: '#fff', border: '1px solid #E8E4DE', padding: '1.75rem', marginBottom: '1.5rem' }}>
                  <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4A4642', fontWeight: 600, marginBottom: '0.4rem' }}>Daily Revenue — Last 30 Days</p>
                  <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.68rem', color: '#8C8680', marginBottom: '1.5rem' }}>Total: ₹{daily.reduce((s,d)=>s+Number(d.revenue),0).toLocaleString('en-IN')}</p>
                  {daily.length === 0 ? (
                    <p style={{ color: '#8C8680', fontSize: '0.8rem', fontFamily: 'Jost, sans-serif', textAlign: 'center', padding: '2rem' }}>No order data yet</p>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '140px', overflowX: 'auto' }}>
                      {daily.map((d, i) => {
                        const h = Math.max((Number(d.revenue) / maxRev) * 120, 2);
                        return (
                          <div key={i} title={`${d.date}: ₹${Number(d.revenue).toLocaleString('en-IN')} (${d.orders} orders)`}
                            style={{ flex: '0 0 auto', width: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'default' }}>
                            <div style={{ width: '100%', backgroundColor: GOLD, height: `${h}px`, opacity: 0.85, transition: 'opacity 0.15s' }} onMouseEnter={e=>e.target.style.opacity=1} onMouseLeave={e=>e.target.style.opacity=0.85} />
                            <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.45rem', color: '#8C8680', transform: 'rotate(-45deg)', whiteSpace: 'nowrap', transformOrigin: 'top left', marginLeft: '8px' }}>
                              {new Date(d.date).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Monthly revenue */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div style={{ backgroundColor: '#fff', border: '1px solid #E8E4DE', padding: '1.75rem' }}>
                    <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4A4642', fontWeight: 600, marginBottom: '1.25rem' }}>Monthly Revenue</p>
                    {monthly.length === 0 ? <p style={{ color: '#8C8680', fontSize: '0.8rem', fontFamily: 'Jost, sans-serif' }}>No data yet</p> : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {monthly.map((m, i) => (
                          <div key={i}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                              <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.68rem', color: '#4A4642' }}>{m.month}</span>
                              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '0.95rem', fontWeight: 600, color: '#1A0F0A' }}>₹{Number(m.revenue).toLocaleString('en-IN')}</span>
                            </div>
                            <div style={{ height: '6px', backgroundColor: '#F0EDE8', width: '100%' }}>
                              <div style={{ height: '100%', backgroundColor: GOLD, width: `${(Number(m.revenue)/maxMon)*100}%`, transition: 'width 0.5s' }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Orders by status */}
                  <div style={{ backgroundColor: '#fff', border: '1px solid #E8E4DE', padding: '1.75rem' }}>
                    <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4A4642', fontWeight: 600, marginBottom: '1.25rem' }}>Orders by Status</p>
                    {statusBD.length === 0 ? <p style={{ color: '#8C8680', fontSize: '0.8rem', fontFamily: 'Jost, sans-serif' }}>No data yet</p> : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {statusBD.map((s, i) => {
                          const maxC = Math.max(...statusBD.map(x=>Number(x.count)),1);
                          const cfg = STATUS_CFG[s.status] || { label: s.status, bg: '#F3F4F6', color: '#374151' };
                          return (
                            <div key={i}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                <StatusBadge status={s.status} />
                                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', fontWeight: 600, color: '#1A0F0A' }}>{s.count}</span>
                              </div>
                              <div style={{ height: '6px', backgroundColor: '#F0EDE8' }}>
                                <div style={{ height: '100%', backgroundColor: cfg.bg, border: `1px solid ${cfg.color}20`, width: `${(Number(s.count)/maxC)*100}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Top products */}
                <div style={{ backgroundColor: '#fff', border: '1px solid #E8E4DE', padding: '1.75rem' }}>
                  <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4A4642', fontWeight: 600, marginBottom: '1.25rem' }}>Top Ordered Products</p>
                  {topP.length === 0 ? (
                    <p style={{ color: '#8C8680', fontSize: '0.8rem', fontFamily: 'Jost, sans-serif' }}>No order data yet — top products will appear here once orders are placed.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      {topP.map((p, i) => {
                        const maxC = Math.max(...topP.map(x=>x.count),1);
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', fontWeight: 600, color: GOLD, width: '20px', textAlign: 'center', flexShrink: 0 }}>{i+1}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                                <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.75rem', color: '#2A2320', fontWeight: 500 }}>{p.name.length>50?p.name.slice(0,50)+'…':p.name}</span>
                                <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.7rem', color: '#6B6560' }}>{p.count} units</span>
                              </div>
                              <div style={{ height: '6px', backgroundColor: '#F0EDE8' }}>
                                <div style={{ height: '100%', backgroundColor: GOLD, width: `${(p.count/maxC)*100}%`, opacity: 0.7 }} />
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
          })()}

        </div>
      </div>

      {/* ══════════ CANCEL ORDER DIALOG ══════════ */}
      {cancelDialog && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#fff', border: '1px solid #E8E4DE', padding: '2rem', maxWidth: '520px', width: '100%', fontFamily: 'Jost, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <p style={{ fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#DC2626', fontWeight: 600, marginBottom: '0.25rem' }}>Cancel Order RAV{cancelDialog.orderId}</p>
                <p style={{ fontSize: '0.78rem', color: '#4A4642' }}>Cancelling for: <strong>{cancelDialog.customerName}</strong></p>
              </div>
              <button onClick={() => setCancelDialog(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8C8680' }}><FiX size={18} /></button>
            </div>

            <p style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8C8680', marginBottom: '0.5rem', fontWeight: 600 }}>Message to Customer</p>
            <p style={{ fontSize: '0.62rem', color: '#8C8680', marginBottom: '0.5rem' }}>This message will be saved with the order. You can share it via WhatsApp or email manually.</p>
            <textarea value={cancelMsg} onChange={e => setCancelMsg(e.target.value)} rows={8}
              style={{ width: '100%', fontFamily: 'Jost, sans-serif', fontSize: '0.75rem', padding: '0.75rem', border: '1px solid #D4CFC8', outline: 'none', resize: 'vertical', color: '#2A2320', boxSizing: 'border-box', lineHeight: 1.6 }} />

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <button onClick={cancelOrder}
                style={{ backgroundColor: '#DC2626', color: '#fff', padding: '0.65rem 1.5rem', border: 'none', cursor: 'pointer', fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Confirm Cancellation
              </button>
              {cancelDialog.customerPhone && (
                <a href={`https://wa.me/${cancelDialog.customerPhone.replace(/\D/g,'')}?text=${encodeURIComponent(cancelMsg)}`} target="_blank" rel="noreferrer"
                  style={{ backgroundColor: '#25D366', color: '#fff', padding: '0.65rem 1.5rem', border: 'none', cursor: 'pointer', fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FiMessageSquare size={13} /> Send via WhatsApp
                </a>
              )}
              {cancelDialog.customerEmail && (
                <a href={`mailto:${cancelDialog.customerEmail}?subject=Order%20RAV${cancelDialog.orderId}%20Cancellation%20%E2%80%94%20RAVARI&body=${encodeURIComponent(cancelMsg)}`}
                  style={{ backgroundColor: 'transparent', color: '#4A4642', padding: '0.65rem 1.5rem', border: '1px solid #D4CFC8', cursor: 'pointer', fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FiMail size={13} /> Send via Email
                </a>
              )}
              <button onClick={() => setCancelDialog(null)}
                style={{ background: 'none', border: '1px solid #D4CFC8', color: '#8C8680', padding: '0.65rem 1rem', cursor: 'pointer', fontFamily: 'Jost, sans-serif', fontSize: '0.65rem' }}>
                Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
