import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { FiPlus, FiEdit, FiTrash2, FiDollarSign, FiPackage, FiBarChart2, FiLogOut, FiTag, FiShoppingBag, FiUploadCloud } from 'react-icons/fi';

const emptyProduct = {
  name: '', slug: '', description: '', category: '', price: '', salePrice: '',
  stock: '', thumbnail: '', isNew: false, isFeatured: false
};
const emptyCoupon = { code: '', type: 'percent', value: '', minOrder: '', expiresAt: '', active: true };

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [uploading, setUploading] = useState(false);

  const [couponForm, setCouponForm] = useState(emptyCoupon);

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) { navigate('/admin-login'); return; }
    setAuthChecked(true);
    loadAll();
  }, [navigate]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const pr = await api.get('/products?limit=100');
      setProducts(pr.data.products || pr.data || []);
    } catch (e) { setProducts([]); }
    try { const cr = await api.get('/coupons'); setCoupons(cr.data.coupons || []); } catch (e) { setCoupons([]); }
    try { const or = await api.get('/admin/orders'); setOrders(or.data.orders || []); } catch (e) { setOrders([]); }
    setLoading(false);
  };

  // ---- Image upload ----
  const uploadImage = async (file) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + (localStorage.getItem('token') || 'admin') },
        body: fd
      });
      const data = await res.json();
      if (data.url) setForm(f => ({ ...f, thumbnail: data.url }));
      else alert('Upload failed: ' + (data.error || 'unknown'));
    } catch (e) { alert('Upload error: ' + e.message); }
    setUploading(false);
  };

  // ---- Products ----
  const saveProduct = async () => {
    if (!form.name || !form.price) { alert('Name and price are required'); return; }
    const payload = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      description: form.description,
      category: form.category,
      price: parseFloat(form.price),
      salePrice: form.salePrice ? parseFloat(form.salePrice) : null,
      stock: parseInt(form.stock || 0, 10),
      thumbnail: form.thumbnail,
      images: form.thumbnail ? [{ url: form.thumbnail, alt: form.name }] : [],
      isNew: !!form.isNew,
      isFeatured: !!form.isFeatured
    };
    try {
      if (editingProduct) await api.put(`/admin/products/${editingProduct.id || editingProduct._id}`, payload);
      else await api.post('/admin/products', payload);
      setForm(emptyProduct); setEditingProduct(null); setShowProductForm(false);
      await loadAll();
      alert('Product saved!');
    } catch (e) { alert('Error saving product: ' + (e.response?.data?.error || e.message)); }
  };

  const editProduct = (p) => {
    setEditingProduct(p);
    setForm({
      name: p.name || '', slug: p.slug || '', description: p.description || '', category: p.category || '',
      price: p.price || '', salePrice: p.salePrice || '', stock: p.stock || '',
      thumbnail: p.thumbnail || '', isNew: !!p.isNew, isFeatured: !!p.isFeatured
    });
    setShowProductForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try { await api.delete(`/admin/products/${id}`); await loadAll(); } catch (e) { alert('Error: ' + e.message); }
  };

  // ---- Coupons ----
  const saveCoupon = async () => {
    if (!couponForm.code || !couponForm.value) { alert('Code and value are required'); return; }
    try {
      await api.post('/admin/coupons', {
        code: couponForm.code, type: couponForm.type, value: parseFloat(couponForm.value),
        minOrder: parseFloat(couponForm.minOrder || 0), expiresAt: couponForm.expiresAt || null, active: couponForm.active
      });
      setCouponForm(emptyCoupon); await loadAll(); alert('Coupon saved!');
    } catch (e) { alert('Error: ' + (e.response?.data?.error || e.message)); }
  };
  const deleteCoupon = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try { await api.delete(`/admin/coupons/${id}`); await loadAll(); } catch (e) { alert('Error: ' + e.message); }
  };

  // ---- Orders ----
  const setOrderStatus = async (id, status) => {
    try { await api.put(`/admin/orders/${id}/status`, { status }); await loadAll(); } catch (e) { alert('Error: ' + e.message); }
  };

  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/'); };

  const totalRevenue = orders.reduce((s, o) => s + Number(o.total || 0), 0);
  const avgOrder = orders.length ? Math.round(totalRevenue / orders.length) : 0;

  const tabBtn = (key, label) => (
    <button onClick={() => setActiveTab(key)}
      className={`px-5 py-3 font-bold text-base sm:text-lg transition whitespace-nowrap ${activeTab === key ? 'text-amber-700 border-b-4 border-amber-600' : 'text-gray-600 hover:text-amber-600'}`}>
      {label}
    </button>
  );
  const inputCls = "px-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600 font-semibold w-full";

  if (!authChecked || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-center">
          <p className="text-2xl font-bold text-amber-700 mb-4">📊 Loading Dashboard...</p>
          <div className="animate-spin inline-block w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="bg-white border-b-4 border-amber-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-orange-600">🎨 RAVARI Admin</h1>
          <button onClick={logout} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold transition"><FiLogOut /> Logout</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-2 sm:gap-4 mb-8 border-b-2 border-amber-200 overflow-x-auto">
          {tabBtn('dashboard', '📊 Dashboard')}
          {tabBtn('products', '📦 Products')}
          {tabBtn('coupons', '🏷️ Coupons')}
          {tabBtn('orders', '🛍️ Orders')}
        </div>

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 className="text-3xl font-bold text-amber-900 mb-8">📈 Sales Analytics</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl border-2 border-amber-200 shadow-lg flex items-center justify-between">
                <div><p className="text-gray-600 text-sm font-semibold">Total Orders</p><p className="text-4xl font-black text-amber-700">{orders.length}</p></div>
                <FiPackage className="text-4xl text-amber-400" />
              </div>
              <div className="bg-white p-6 rounded-xl border-2 border-amber-200 shadow-lg flex items-center justify-between">
                <div><p className="text-gray-600 text-sm font-semibold">Total Products</p><p className="text-4xl font-black text-orange-700">{products.length}</p></div>
                <FiBarChart2 className="text-4xl text-orange-400" />
              </div>
              <div className="bg-white p-6 rounded-xl border-2 border-amber-200 shadow-lg flex items-center justify-between">
                <div><p className="text-gray-600 text-sm font-semibold">Total Revenue</p><p className="text-3xl font-black text-green-700">₹{totalRevenue.toLocaleString()}</p></div>
                <FiDollarSign className="text-4xl text-green-400" />
              </div>
              <div className="bg-white p-6 rounded-xl border-2 border-amber-200 shadow-lg flex items-center justify-between">
                <div><p className="text-gray-600 text-sm font-semibold">Active Coupons</p><p className="text-4xl font-black text-blue-700">{coupons.filter(c => c.active).length}</p></div>
                <FiTag className="text-4xl text-blue-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-amber-900 mb-4">📋 Recent Orders</h3>
            <div className="bg-white rounded-xl shadow-lg overflow-x-auto border-2 border-amber-200">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-amber-100 to-orange-100">
                  <tr><th className="px-6 py-3 text-left font-bold text-amber-900">Order</th><th className="px-6 py-3 text-left font-bold text-amber-900">Customer</th><th className="px-6 py-3 text-left font-bold text-amber-900">Amount</th><th className="px-6 py-3 text-left font-bold text-amber-900">Status</th></tr>
                </thead>
                <tbody>
                  {orders.length === 0 && <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No orders yet</td></tr>}
                  {orders.slice(0, 8).map(o => (
                    <tr key={o.id} className="border-t hover:bg-amber-50">
                      <td className="px-6 py-4 font-semibold text-gray-900">#{o.id}</td>
                      <td className="px-6 py-4 text-gray-700">{o.customerName || '—'}</td>
                      <td className="px-6 py-4 font-bold text-amber-700">₹{o.total}</td>
                      <td className="px-6 py-4"><span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold">{o.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PRODUCTS */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
              <h2 className="text-3xl font-bold text-amber-900">📦 Product Management</h2>
              <button onClick={() => { setEditingProduct(null); setForm(emptyProduct); setShowProductForm(!showProductForm); }}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition"><FiPlus /> Add New Product</button>
            </div>

            {showProductForm && (
              <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-amber-200 mb-8">
                <h3 className="text-2xl font-bold text-amber-900 mb-6">{editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}</h3>

                {/* Image upload */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-amber-900 mb-2">Product Image</label>
                  <div className="flex items-center gap-4 flex-wrap">
                    {form.thumbnail ? (
                      <img src={form.thumbnail} alt="preview" className="w-28 h-28 object-cover rounded-lg border-2 border-amber-200" />
                    ) : (
                      <div className="w-28 h-28 rounded-lg border-2 border-dashed border-amber-300 flex items-center justify-center text-amber-400"><FiUploadCloud size={28} /></div>
                    )}
                    <label className="cursor-pointer bg-amber-100 hover:bg-amber-200 text-amber-800 px-4 py-3 rounded-lg font-bold transition">
                      {uploading ? 'Uploading...' : '📤 Upload Image'}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && uploadImage(e.target.files[0])} />
                    </label>
                    <input type="text" placeholder="...or paste image URL" value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} className={inputCls + ' flex-1 min-w-[200px]'} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input type="text" placeholder="Product Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
                  <input type="text" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls} />
                  <input type="number" placeholder="Price (₹) *" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputCls} />
                  <input type="number" placeholder="Sale Price (₹)" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} className={inputCls} />
                  <input type="number" placeholder="Stock Quantity" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className={inputCls} />
                  <input type="text" placeholder="Slug (auto if empty)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputCls} />
                </div>
                <textarea placeholder="Product Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls + ' mt-6 h-24'} />
                <div className="flex gap-6 mt-4">
                  <label className="flex items-center gap-2 font-semibold text-gray-700"><input type="checkbox" checked={form.isNew} onChange={(e) => setForm({ ...form, isNew: e.target.checked })} /> 🆕 Mark as New</label>
                  <label className="flex items-center gap-2 font-semibold text-gray-700"><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> ⭐ Featured</label>
                </div>
                <div className="flex gap-4 mt-6">
                  <button onClick={saveProduct} className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-bold hover:shadow-lg transition">{editingProduct ? '✅ Update' : '✅ Add Product'}</button>
                  <button onClick={() => { setShowProductForm(false); setEditingProduct(null); }} className="flex-1 bg-gray-400 text-white py-3 rounded-lg font-bold hover:bg-gray-500 transition">Cancel</button>
                </div>
              </div>
            )}

            <h3 className="text-2xl font-bold text-amber-900 mb-4">All Products ({products.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(p => (
                <div key={p.id} className="bg-white rounded-xl shadow-lg border-2 border-amber-200 hover:shadow-xl transition overflow-hidden">
                  {p.thumbnail && <img src={p.thumbnail} alt={p.name} className="w-full h-44 object-cover" />}
                  <div className="p-5">
                    <h4 className="text-lg font-bold text-amber-900 mb-1 line-clamp-1">{p.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{p.category}</p>
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-2xl font-black text-amber-700">₹{p.salePrice || p.price}</p>
                      <p className="text-sm text-gray-600">Stock: <b className="text-blue-700">{p.stock}</b></p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => editProduct(p)} className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-bold transition"><FiEdit /> Edit</button>
                      <button onClick={() => deleteProduct(p.id || p._id)} className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-bold transition"><FiTrash2 /> Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COUPONS */}
        {activeTab === 'coupons' && (
          <div>
            <h2 className="text-3xl font-bold text-amber-900 mb-6">🏷️ Coupons & Discounts</h2>
            <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-amber-200 mb-8">
              <h3 className="text-xl font-bold text-amber-900 mb-4">➕ Create Coupon</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" placeholder="CODE (e.g. SAVE20)" value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} className={inputCls} />
                <select value={couponForm.type} onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value })} className={inputCls}>
                  <option value="percent">Percentage (%)</option>
                  <option value="flat">Flat (₹)</option>
                </select>
                <input type="number" placeholder={couponForm.type === 'percent' ? 'Value (%)' : 'Value (₹)'} value={couponForm.value} onChange={(e) => setCouponForm({ ...couponForm, value: e.target.value })} className={inputCls} />
                <input type="number" placeholder="Min Order (₹)" value={couponForm.minOrder} onChange={(e) => setCouponForm({ ...couponForm, minOrder: e.target.value })} className={inputCls} />
                <input type="date" placeholder="Expiry" value={couponForm.expiresAt} onChange={(e) => setCouponForm({ ...couponForm, expiresAt: e.target.value })} className={inputCls} />
                <label className="flex items-center gap-2 font-semibold text-gray-700"><input type="checkbox" checked={couponForm.active} onChange={(e) => setCouponForm({ ...couponForm, active: e.target.checked })} /> Active</label>
              </div>
              <button onClick={saveCoupon} className="mt-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition">Create Coupon</button>
            </div>

            <h3 className="text-2xl font-bold text-amber-900 mb-4">All Coupons ({coupons.length})</h3>
            <div className="bg-white rounded-xl shadow-lg overflow-x-auto border-2 border-amber-200">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-amber-100 to-orange-100">
                  <tr><th className="px-6 py-3 text-left font-bold text-amber-900">Code</th><th className="px-6 py-3 text-left font-bold text-amber-900">Discount</th><th className="px-6 py-3 text-left font-bold text-amber-900">Min Order</th><th className="px-6 py-3 text-left font-bold text-amber-900">Status</th><th className="px-6 py-3 text-left font-bold text-amber-900">Action</th></tr>
                </thead>
                <tbody>
                  {coupons.length === 0 && <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No coupons yet</td></tr>}
                  {coupons.map(c => (
                    <tr key={c.id} className="border-t hover:bg-amber-50">
                      <td className="px-6 py-4 font-black text-amber-700">{c.code}</td>
                      <td className="px-6 py-4 font-semibold">{c.type === 'flat' ? `₹${c.value}` : `${c.value}%`}</td>
                      <td className="px-6 py-4">₹{c.minOrder || 0}</td>
                      <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-sm font-bold ${c.active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>{c.active ? 'Active' : 'Inactive'}</span></td>
                      <td className="px-6 py-4"><button onClick={() => deleteCoupon(c.id)} className="text-red-500 hover:text-red-700 font-bold flex items-center gap-1"><FiTrash2 /> Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ORDERS */}
        {activeTab === 'orders' && (
          <div>
            <h2 className="text-3xl font-bold text-amber-900 mb-6">🛍️ Orders</h2>
            <div className="bg-white rounded-xl shadow-lg overflow-x-auto border-2 border-amber-200">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-amber-100 to-orange-100">
                  <tr><th className="px-6 py-3 text-left font-bold text-amber-900">Order</th><th className="px-6 py-3 text-left font-bold text-amber-900">Customer</th><th className="px-6 py-3 text-left font-bold text-amber-900">Items</th><th className="px-6 py-3 text-left font-bold text-amber-900">Total</th><th className="px-6 py-3 text-left font-bold text-amber-900">Status</th></tr>
                </thead>
                <tbody>
                  {orders.length === 0 && <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500"><FiShoppingBag className="inline mr-2" />No orders yet. They'll appear here when customers checkout.</td></tr>}
                  {orders.map(o => (
                    <tr key={o.id} className="border-t hover:bg-amber-50">
                      <td className="px-6 py-4 font-semibold">#{o.id}</td>
                      <td className="px-6 py-4">{o.customerName || '—'}<br /><span className="text-xs text-gray-500">{o.customerEmail}</span></td>
                      <td className="px-6 py-4">{Array.isArray(o.items) ? o.items.length : 0} item(s)</td>
                      <td className="px-6 py-4 font-bold text-amber-700">₹{o.total}</td>
                      <td className="px-6 py-4">
                        <select value={o.status} onChange={(e) => setOrderStatus(o.id, e.target.value)} className="border-2 border-amber-200 rounded-lg px-2 py-1 font-semibold">
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
