"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCheckoutSession = exports.deleteOrder = exports.updateOrderStatus = exports.getOrder = exports.getUserOrders = exports.getOrders = exports.createOrder = exports.createPaymentIntent = void 0;
const Order_1 = __importDefault(require("../models/Order"));
const Product_1 = __importDefault(require("../models/Product"));
const User_1 = __importDefault(require("../models/User"));
const stripe_1 = __importDefault(require("stripe"));
const emailService_1 = require("../services/emailService");
// Create Stripe Payment Intent
const createPaymentIntent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }
        if (!process.env.STRIPE_SECRET_KEY) {
            console.error('Stripe secret key is missing');
            return res.status(500).json({ message: 'Payment service configuration error' });
        }
        const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2023-10-16',
        });
        const paymentIntent = yield stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: 'cad',
        });
        res.json({ clientSecret: paymentIntent.client_secret });
    }
    catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ message: 'Error creating payment intent' });
    }
});
exports.createPaymentIntent = createPaymentIntent;
// Create a new order
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { items, shippingAddress, paymentMethod, paymentDetails } = req.body;
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
            userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id, // Optional - will be undefined for guest orders
            items: yield Promise.all(items.map((item) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const product = yield Product_1.default.findById(item.productId);
                    if (!product) {
                        throw new Error(`Product not found: ${item.productId}`);
                    }
                    return {
                        productId: product._id,
                        quantity: item.quantity,
                        price: product.price
                    };
                }
                catch (error) {
                    console.error('Error processing product:', error);
                    throw error;
                }
            }))),
            total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0) +
                (paymentDetails.shippingCost || 0) +
                (paymentDetails.tipAmount || 0),
            shippingAddress,
            paymentMethod,
            paymentDetails,
            status: 'pending',
            date: new Date()
        };
        const order = new Order_1.default(orderData);
        const savedOrder = yield order.save();
        const populatedOrder = yield Order_1.default.findById(savedOrder._id)
            .populate('items.productId')
            .populate('userId', 'name email');
        if (!populatedOrder) {
            throw new Error('Failed to populate order after saving');
        }
        // Send email notifications to admin users
        try {
            const adminUsers = yield User_1.default.find({ role: 'admin' });
            if (adminUsers.length === 0) {
                console.warn('No admin users found to send order notifications to');
            }
            else {
                const orderDetails = {
                    _id: populatedOrder._id.toString(),
                    items: populatedOrder.items.map(item => ({
                        productId: {
                            name: item.productId.name,
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
                const emailResults = yield Promise.allSettled(adminUsers.map(admin => (0, emailService_1.sendOrderNotification)(orderDetails, admin.email)));
                // Log results of email sending attempts
                emailResults.forEach((result, index) => {
                    if (result.status === 'fulfilled') {
                        console.log(`Successfully sent order notification to ${adminUsers[index].email}`);
                    }
                    else {
                        console.error(`Failed to send order notification to ${adminUsers[index].email}:`, result.reason);
                    }
                });
            }
        }
        catch (emailError) {
            // Log the error but don't fail the order creation
            console.error('Error in email notification process:', emailError);
        }
        res.status(201).json(populatedOrder);
    }
    catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Error creating order' });
    }
});
exports.createOrder = createOrder;
// Get all orders (admin only)
const getOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield Order_1.default.find()
            .populate('items.productId')
            .populate('userId', 'name email')
            .sort({ date: -1 });
        res.json(orders);
    }
    catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Error fetching orders' });
    }
});
exports.getOrders = getOrders;
// Get user's orders
const getUserOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const orders = yield Order_1.default.find({ userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id })
            .populate('items.productId')
            .sort({ date: -1 });
        res.json(orders);
    }
    catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ message: 'Error fetching user orders' });
    }
});
exports.getUserOrders = getUserOrders;
// Get a specific order
const getOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield Order_1.default.findById(req.params.id)
            .populate('items.productId')
            .populate('userId', 'name email');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    }
    catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Error fetching order' });
    }
});
exports.getOrder = getOrder;
// Update order status (admin only)
const updateOrderStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.body;
        const order = yield Order_1.default.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('items.productId');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    }
    catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Error updating order status' });
    }
});
exports.updateOrderStatus = updateOrderStatus;
// Delete order (admin only)
const deleteOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield Order_1.default.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        if (order.status !== 'delivered') {
            return res.status(400).json({ message: 'Only delivered orders can be deleted' });
        }
        yield Order_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: 'Order deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ message: 'Error deleting order' });
    }
});
exports.deleteOrder = deleteOrder;
// Create Stripe Checkout Session
const createCheckoutSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { items } = req.body;
        if (!process.env.STRIPE_SECRET_KEY) {
            return res.status(500).json({ message: 'Stripe configuration error' });
        }
        const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2023-10-16',
        });
        const session = yield stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: items.map((item) => ({
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
    }
    catch (error) {
        console.error('Error creating Stripe Checkout session:', error);
        res.status(500).json({ message: 'Error creating checkout session' });
    }
});
exports.createCheckoutSession = createCheckoutSession;
