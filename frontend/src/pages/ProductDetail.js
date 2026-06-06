import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = '/api';

function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API_URL}/products/slug/${slug}`);
      setProduct(response.data.data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!product) return <div className="text-center py-20">Product not found</div>;

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 gap-12">
          <div>
            <img
              src={product.thumbnail}
              alt={product.name}
              className="w-full rounded-lg shadow-lg"
              onError={(e) => { e.target.src = '/placeholder.jpg'; }}
            />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-4 text-gray-900">{product.name}</h1>
            <p className="text-lg text-gray-600 mb-6">{product.category}</p>

            <div className="mb-6">
              {product.salePrice ? (
                <>
                  <span className="text-3xl font-bold text-amber-600">₹{product.salePrice}</span>
                  <span className="text-xl text-gray-400 line-through ml-4">₹{product.price}</span>
                </>
              ) : (
                <span className="text-3xl font-bold text-amber-600">₹{product.price}</span>
              )}
            </div>

            <p className="text-gray-700 mb-6">{product.description}</p>

            {product.material && (
              <div className="mb-4">
                <strong>Material:</strong> {product.material}
              </div>
            )}

            {product.color && product.color.length > 0 && (
              <div className="mb-4">
                <strong>Colors:</strong> {product.color.join(', ')}
              </div>
            )}

            <div className="mb-8">
              <label className="block mb-2">Quantity:</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
                className="w-20 px-3 py-2 border border-gray-300 rounded"
              />
            </div>

            <button className="w-full bg-amber-600 text-white py-4 rounded-lg font-bold hover:bg-amber-700 text-lg mb-4">
              Add to Cart
            </button>

            <button className="w-full bg-gray-200 text-gray-900 py-4 rounded-lg font-bold hover:bg-gray-300">
              Save for Later
            </button>

            {product.careInstructions && (
              <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                <h3 className="font-bold mb-2">Care Instructions:</h3>
                <p className="text-gray-700">{product.careInstructions}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
