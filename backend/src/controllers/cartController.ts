import { Request, Response } from 'express';
import Cart from '../models/Cart';
import Product from '../models/Product';

interface AuthRequest extends Request {
  user?: {
    _id: string;
    role: string;
    name: string;
    email: string;
  };
}

// Get cart
export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    let cart;
    
    if (req.user?._id) {
      // Get user's cart
      cart = await Cart.findOne({ userId: req.user._id })
        .populate('items.productId');
    } else {
      // For guest users, return empty cart
      cart = { items: [], total: 0 };
    }

    res.json(cart || { items: [], total: 0 });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Error fetching cart' });
  }
};

// Add item to cart
export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ message: 'Product ID and quantity are required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let cart = await Cart.findOne({ userId: req.user?._id });

    if (!cart) {
      // Create new cart if it doesn't exist
      cart = new Cart({
        userId: req.user?._id,
        items: [],
        total: 0
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        productId: product._id,
        quantity,
        price: product.price
      });
    }

    // Update total
    cart.total = cart.items.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );

    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate('items.productId');

    res.json(populatedCart);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Error adding to cart' });
  }
};

// Update cart item quantity
export const updateCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({ message: 'Product ID and quantity are required' });
    }

    const cart = await Cart.findOne({ userId: req.user?._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    }

    // Update total
    cart.total = cart.items.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );

    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate('items.productId');

    res.json(populatedCart);
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ message: 'Error updating cart' });
  }
};

// Remove item from cart
export const removeFromCart = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId: req.user?._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      item => item.productId.toString() !== productId
    );

    // Update total
    cart.total = cart.items.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );

    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate('items.productId');

    res.json(populatedCart);
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Error removing from cart' });
  }
};

// Clear cart
export const clearCart = async (req: AuthRequest, res: Response) => {
  try {
    const cart = await Cart.findOne({ userId: req.user?._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    cart.total = 0;
    await cart.save();

    res.json(cart);
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Error clearing cart' });
  }
}; 