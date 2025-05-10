import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getUserOrders,
  getOrder,
  updateOrderStatus,
  deleteOrder,
  createPaymentIntent,
  createCheckoutSession
} from '../controllers/orderController';
import { auth } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';

const router = Router();

// Public routes
router.post('/payment-intent', createPaymentIntent);
router.post('/', createOrder);

// Protected routes
router.get('/', auth, getOrders);
router.get('/user', auth, getUserOrders);
router.get('/:id', auth, getOrder);
router.patch('/:id/status', auth, isAdmin, updateOrderStatus);
router.delete('/:id', auth, isAdmin, deleteOrder);

export default router; 