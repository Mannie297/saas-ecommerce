import express from 'express';
import { createProduct, getProducts, getProduct, updateProduct, deleteProduct } from '../controllers/productController';
import { auth } from '../middleware/auth';
import { adminAuth } from '../middleware/adminAuth';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);

// Admin routes
router.post('/', auth, adminAuth, createProduct);
router.put('/:id', auth, adminAuth, updateProduct);
router.delete('/:id', auth, adminAuth, deleteProduct);

export default router; 