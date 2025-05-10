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
exports.deleteOrder = exports.updateOrderStatus = exports.getOrder = exports.getUserOrders = exports.getAllOrders = exports.createOrder = void 0;
const Order_1 = __importDefault(require("../models/Order"));
// Create a new order
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const order = new Order_1.default({
            userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
            items: req.body.items,
            total: req.body.total,
            shippingAddress: req.body.shippingAddress,
            paymentMethod: req.body.paymentMethod,
            status: 'pending',
            date: new Date()
        });
        yield order.save();
        res.status(201).json(order);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating order' });
    }
});
exports.createOrder = createOrder;
// Get all orders (admin only)
const getAllOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield Order_1.default.find()
            .populate('userId', 'name email')
            .populate('items.productId', 'name price image');
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error });
    }
});
exports.getAllOrders = getAllOrders;
// Get user's orders
const getUserOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const orders = yield Order_1.default.find({ userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id })
            .sort({ date: -1 });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching orders' });
    }
});
exports.getUserOrders = getUserOrders;
// Get a specific order
const getOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const order = yield Order_1.default.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        // Check if user is admin or if the order belongs to the user
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'admin' && order.userId.toString() !== ((_b = req.user) === null || _b === void 0 ? void 0 : _b._id.toString())) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching order' });
    }
});
exports.getOrder = getOrder;
// Update order status (admin only)
const updateOrderStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const order = yield Order_1.default.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        order.status = req.body.status;
        yield order.save();
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating order status' });
    }
});
exports.updateOrderStatus = updateOrderStatus;
// Delete order (admin only)
const deleteOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const order = yield Order_1.default.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        yield Order_1.default.deleteOne({ _id: order._id });
        res.json({ message: 'Order deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting order' });
    }
});
exports.deleteOrder = deleteOrder;
