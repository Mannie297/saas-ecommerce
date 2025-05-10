import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/cartController';
import { optionalAuth } from '../middleware/optionalAuth';

const router = express.Router();

// All cart routes are optional authenticated
// This means they will work for both authenticated and guest users
router.get('/', optionalAuth, getCart);
router.post('/add', optionalAuth, addToCart);
router.put('/update', optionalAuth, updateCartItem);
router.delete('/remove/:productId', optionalAuth, removeFromCart);
router.delete('/clear', optionalAuth, clearCart);

export default router; 