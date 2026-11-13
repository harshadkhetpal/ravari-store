import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import cartReducer from './slices/cartSlice';
import authReducer from './slices/authSlice';
import productsReducer from './slices/productsSlice';
import wishlistReducer from './slices/wishlistSlice';
import { track } from '../utils/tracker';

const rootReducer = combineReducers({
  cart: cartReducer,
  auth: authReducer,
  products: productsReducer,
  wishlist: wishlistReducer
});

// Analytics: one place that observes every cart change (no per-page wiring needed)
const analyticsMiddleware = storeApi => next => action => {
  try {
    if (action.type === 'ADD_TO_CART') {
      const p = action.payload || {};
      track('add_to_cart', { productId: p.productId, name: p.name, value: (p.price || 0) * (p.quantity || 1), qty: p.quantity || 1 });
    } else if (action.type === 'REMOVE_FROM_CART') {
      const it = (storeApi.getState().cart.items || []).find(i => i.productId === action.payload);
      track('remove_from_cart', { productId: action.payload, name: it && it.name, value: it ? it.price * it.quantity : undefined, qty: it && it.quantity });
    } else if (action.type === 'UPDATE_QUANTITY') {
      const p = action.payload || {};
      track('quantity_change', { productId: p.productId, qty: p.quantity, element: 'cart' });
    }
  } catch (_) { /* analytics must never break the cart */ }
  return next(action);
};

const store = createStore(rootReducer, applyMiddleware(thunk, analyticsMiddleware));

export default store;
