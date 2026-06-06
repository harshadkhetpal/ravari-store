import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = '/api';

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ total: 0, featured: 0, sales: 0 });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin-login');
      return;
    }
    fetchProducts();
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products?limit=100`);
      const prods = response.data.data || [];
      setProducts(prods);
      setStats({
        total: prods.length,
        featured: prods.filter(p => p.isFeatured).length,
        sales: prods.filter(p => p.salePrice).length
      });
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    navigate('/admin-login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-amber-700">Ravari Admin</h1>
          </div>
          <nav className="space-y-2 p-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full text-left px-4 py-2 rounded ${
                activeTab === 'dashboard' ? 'bg-amber-600 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full text-left px-4 py-2 rounded ${
                activeTab === 'products' ? 'bg-amber-600 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Products
            </button>
          </nav>
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-3xl font-bold mb-8 text-gray-900">Dashboard</h2>

              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg p-6 shadow">
                  <h3 className="text-gray-600 mb-2">Total Products</h3>
                  <p className="text-4xl font-bold text-amber-600">{stats.total}</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow">
                  <h3 className="text-gray-600 mb-2">Featured</h3>
                  <p className="text-4xl font-bold text-amber-600">{stats.featured}</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow">
                  <h3 className="text-gray-600 mb-2">On Sale</h3>
                  <p className="text-4xl font-bold text-amber-600">{stats.sales}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow">
                <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
                <p className="text-gray-600">Welcome to Ravari Admin Dashboard!</p>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Products</h2>
                <button className="bg-amber-600 text-white px-6 py-2 rounded hover:bg-amber-700">
                  Add Product
                </button>
              </div>

              {products.length > 0 ? (
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left">Name</th>
                        <th className="px-6 py-3 text-left">Category</th>
                        <th className="px-6 py-3 text-left">Price</th>
                        <th className="px-6 py-3 text-left">Stock</th>
                        <th className="px-6 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.slice(0, 10).map((product) => (
                        <tr key={product._id} className="border-b hover:bg-gray-50">
                          <td className="px-6 py-3 font-medium">{product.name}</td>
                          <td className="px-6 py-3">{product.category}</td>
                          <td className="px-6 py-3">₹{product.price}</td>
                          <td className="px-6 py-3">{product.stock}</td>
                          <td className="px-6 py-3">
                            <button className="text-blue-600 hover:underline mr-4">Edit</button>
                            <button className="text-red-600 hover:underline">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-white rounded-lg p-8 text-center text-gray-600">
                  No products available
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
