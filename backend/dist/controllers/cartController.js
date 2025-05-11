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
exports.clearCart = exports.removeFromCart = exports.updateCartItem = exports.addToCart = exports.getCart = void 0;
const Cart_1 = __importDefault(require("../models/Cart"));
const Product_1 = __importDefault(require("../models/Product"));
// Get cart
const getCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let cart;
        if ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) {
            // Get user's cart
            cart = yield Cart_1.default.findOne({ userId: req.user._id })
                .populate('items.productId');
        }
        else {
            // For guest users, return empty cart
            cart = { items: [], total: 0 };
        }
        res.json(cart || { items: [], total: 0 });
    }
    catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Error fetching cart' });
    }
});
exports.getCart = getCart;
// Add item to cart
const addToCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { productId, quantity } = req.body;
        if (!productId || !quantity) {
            return res.status(400).json({ message: 'Product ID and quantity are required' });
        }
        const product = yield Product_1.default.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        let cart = yield Cart_1.default.findOne({ userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id });
        if (!cart) {
            // Create new cart if it doesn't exist
            cart = new Cart_1.default({
                userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id,
                items: [],
                total: 0
            });
        }
        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        if (existingItemIndex > -1) {
            // Update quantity if item exists
            cart.items[existingItemIndex].quantity += quantity;
        }
        else {
            // Add new item
            cart.items.push({
                productId: product._id,
                quantity,
                price: product.price
            });
        }
        // Update total
        cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        yield cart.save();
        const populatedCart = yield Cart_1.default.findById(cart._id)
            .populate('items.productId');
        res.json(populatedCart);
    }
    catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ message: 'Error adding to cart' });
    }
});
exports.addToCart = addToCart;
// Update cart item quantity
const updateCartItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { productId, quantity } = req.body;
        if (!productId || quantity === undefined) {
            return res.status(400).json({ message: 'Product ID and quantity are required' });
        }
        const cart = yield Cart_1.default.findOne({ userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }
        if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            cart.items.splice(itemIndex, 1);
        }
        else {
            // Update quantity
            cart.items[itemIndex].quantity = quantity;
        }
        // Update total
        cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        yield cart.save();
        const populatedCart = yield Cart_1.default.findById(cart._id)
            .populate('items.productId');
        res.json(populatedCart);
    }
    catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).json({ message: 'Error updating cart' });
    }
});
exports.updateCartItem = updateCartItem;
// Remove item from cart
const removeFromCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { productId } = req.params;
        const cart = yield Cart_1.default.findOne({ userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        cart.items = cart.items.filter(item => item.productId.toString() !== productId);
        // Update total
        cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        yield cart.save();
        const populatedCart = yield Cart_1.default.findById(cart._id)
            .populate('items.productId');
        res.json(populatedCart);
    }
    catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ message: 'Error removing from cart' });
    }
});
exports.removeFromCart = removeFromCart;
// Clear cart
const clearCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const cart = yield Cart_1.default.findOne({ userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        cart.items = [];
        cart.total = 0;
        yield cart.save();
        res.json(cart);
    }
    catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ message: 'Error clearing cart' });
    }
});
exports.clearCart = clearCart;
