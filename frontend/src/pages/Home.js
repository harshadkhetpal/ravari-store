import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = '/api';

function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products/featured`);
      setFeatured(response.data.data || []);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-amber-600 to-orange-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Feel Timeless</h1>
          <p className="text-xl mb-8">Luxury Lifestyle Products Crafted with Care</p>
          <button className="bg-white text-amber-700 px-8 py-3 rounded-lg font-bold hover:bg-amber-50">
            Shop Now
          </button>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-amber-700">Featured Products</h2>

          {loading ? (
            <div className="text-center py-12">Loading products...</div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featured.map((product) => (
                <div key={product._id} className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <img
                      src={product.thumbnail}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold mb-2">{product.name}</h3>
                    <p className="text-gray-600 mb-4">{product.category}</p>
                    <div className="flex justify-between items-center">
                      <div>
                        {product.salePrice ? (
                          <>
                            <span className="text-amber-600 font-bold text-lg">₹{product.salePrice}</span>
                            <span className="text-gray-400 line-through ml-2">₹{product.price}</span>
                          </>
                        ) : (
                          <span className="text-amber-600 font-bold text-lg">₹{product.price}</span>
                        )}
                      </div>
                      <button className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700">
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">No products available</div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;
