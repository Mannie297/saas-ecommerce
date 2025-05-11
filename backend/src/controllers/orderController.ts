import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Order from '../models/Order';
import Product from '../models/Product';
import User from '../models/User';
import Stripe from 'stripe';
import { sendOrderNotification } from '../services/emailService';

interface AuthRequest extends Request {
  user?: {
    _id: string;
    role: string;
    name: string;
    email: string;
  };
  body: {
    items?: Array<{
      productId: string;
      quantity: number;
      price?: number;
    }>;
    shippingAddress?: {
      name: string;
      email: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
    };
    paymentMethod?: string;
    paymentDetails?: {
      stripePaymentId: string;
      shippingCost?: number;
      tipAmount?: number;
    };
    status?: 'pending' | 'processing' | 'shipped' | 'delivered';
    [key: string]: any;
  };
  params: {
    id: string;
    [key: string]: string;
  };
}

interface PopulatedUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
}

interface PopulatedProduct {
  _id: Types.ObjectId;
  name: string;
  price: number;
  image: string;
}

interface PopulatedOrder {
  _id: Types.ObjectId;
  userId: PopulatedUser;
  items: Array<{
    _id: Types.ObjectId;
    productId: PopulatedProduct;
    quantity: number;
  }>;
  total: number;
  shippingAddress: {
    name: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  paymentMethod: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  date: Date;
}

// Create Stripe Payment Intent
export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Stripe secret key is missing');
      return res.status(500).json({ message: 'Payment service configuration error' });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'cad',
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ message: 'Error creating payment intent' });
  }
};

// Create a new order
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { items, shippingAddress, paymentMethod, paymentDetails } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Valid items array is required' });
    }

    if (!paymentDetails) {
      console.error('Payment details missing from request');
      return res.status(400).json({ message: 'Payment details are required' });
    }

    if (!paymentDetails.stripePaymentId) {
      console.error('Stripe payment ID missing from payment details');
      return res.status(400).json({ message: 'Stripe payment ID is required' });
    }

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.email) {
      return res.status(400).json({ message: 'Valid shipping address with email is required' });
    }

    const orderData = {
      userId: req.user?._id, // Optional - will be undefined for guest orders
      items: await Promise.all(items.map(async (item: any) => {
        try {
          const product = await Product.findById(item.productId);
          if (!product) {
            throw new Error(`Product not found: ${item.productId}`);
          }
          return {
            productId: product._id,
            quantity: item.quantity,
            price: product.price
          };
        } catch (error) {
          console.error('Error processing product:', error);
          throw error;
        }
      })),
      total: items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) + 
             (paymentDetails.shippingCost || 0) + 
             (paymentDetails.tipAmount || 0),
      shippingAddress,
      paymentMethod,
      paymentDetails,
      status: 'pending',
      date: new Date()
    };

    const order = new Order(orderData);
    const savedOrder = await order.save();
    const populatedOrder = await Order.findById(savedOrder._id)
      .populate('items.productId')
      .populate('userId', 'name email');

    if (!populatedOrder) {
      throw new Error('Failed to populate order after saving');
    }

    // Send email notifications to admin users
    try {
      const adminUsers = await User.find({ role: 'admin' });
      if (adminUsers.length === 0) {
        console.warn('No admin users found to send order notifications to');
      } else {
        const orderDetails = {
          _id: populatedOrder._id.toString(),
          items: populatedOrder.items.map(item => ({
            productId: {
              name: (item.productId as any).name,
              price: item.price
            },
            quantity: item.quantity,
            price: item.price
          })),
          total: populatedOrder.total,
          shippingAddress: {
            street: populatedOrder.shippingAddress.address,
            city: populatedOrder.shippingAddress.city,
            state: populatedOrder.shippingAddress.state,
            zipCode: populatedOrder.shippingAddress.zipCode,
            country: 'Canada' // Assuming all orders are from Canada
          },
          customerName: populatedOrder.shippingAddress.name,
          customerEmail: populatedOrder.shippingAddress.email,
          date: populatedOrder.date
        };

        console.log('Sending order notifications to admin users:', adminUsers.map(admin => admin.email));
        
        // Send email to each admin user
        const emailResults = await Promise.allSettled(
          adminUsers.map(admin => sendOrderNotification(orderDetails, admin.email))
        );

        // Log results of email sending attempts
        emailResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            console.log(`Successfully sent order notification to ${adminUsers[index].email}`);
          } else {
            console.error(`Failed to send order notification to ${adminUsers[index].email}:`, result.reason);
          }
        });
      }
    } catch (emailError) {
      // Log the error but don't fail the order creation
      console.error('Error in email notification process:', emailError);
    }

    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order' });
  }
};

// Get all orders (admin only)
export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find()
      .populate('items.productId')
      .populate('userId', 'name email')
      .sort({ date: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

// Get user's orders
export const getUserOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find({ userId: req.user?._id })
      .populate('items.productId')
      .sort({ date: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Error fetching user orders' });
  }
};

// Get a specific order
export const getOrder = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.productId')
      .populate('userId', 'name email');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Error fetching order' });
  }
};

// Update order status (admin only)
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('items.productId');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Error updating order status' });
  }
};

// Delete order (admin only)
export const deleteOrder = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.status !== 'delivered') {
      return res.status(400).json({ message: 'Only delivered orders can be deleted' });
    }
    
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Error deleting order' });
  }
};

// Create Stripe Checkout Session
export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { items } = req.body;

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ message: 'Stripe configuration error' });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: 'cad',
          product_data: {
            name: item.name,
            images: [item.image],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cart`,
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating Stripe Checkout session:', error);
    res.status(500).json({ message: 'Error creating checkout session' });
  }
}; 