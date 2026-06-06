import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = '/api';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/products`, { params: { page, limit: 12 } });
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-12 text-amber-700">Shop Collection</h1>

        {loading ? (
          <div className="text-center py-12">Loading products...</div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              {products.map((product) => (
                <div key={product._id} className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow">
                  <div className="h-40 bg-gray-200 flex items-center justify-center">
                    <img
                      src={product.thumbnail}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold mb-1 line-clamp-2">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                    <div className="flex justify-between items-center">
                      {product.salePrice ? (
                        <>
                          <span className="text-amber-600 font-bold">₹{product.salePrice}</span>
                          <span className="text-xs text-gray-400 line-through">₹{product.price}</span>
                        </>
                      ) : (
                        <span className="text-amber-600 font-bold">₹{product.price}</span>
                      )}
                      <button className="bg-amber-600 text-white px-3 py-1 rounded text-sm hover:bg-amber-700">
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-amber-600 text-white rounded disabled:bg-gray-300"
              >
                Previous
              </button>
              <span className="px-4 py-2">Page {page}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">No products available</div>
        )}
      </div>
    </div>
  );
}

export default Products;
