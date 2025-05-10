"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const orderController_1 = require("../controllers/orderController");
const auth_1 = require("../middleware/auth");
const isAdmin_1 = require("../middleware/isAdmin");
const router = express_1.default.Router();
// Create a new order
router.post('/', auth_1.auth, orderController_1.createOrder);
// Get all orders (admin only)
router.get('/', auth_1.auth, isAdmin_1.isAdmin, orderController_1.getAllOrders);
// Get user's orders
router.get('/user', auth_1.auth, orderController_1.getUserOrders);
// Get a specific order
router.get('/:id', auth_1.auth, orderController_1.getOrder);
// Update order status (admin only)
router.patch('/:id/status', auth_1.auth, isAdmin_1.isAdmin, orderController_1.updateOrderStatus);
// Delete order (admin only)
router.delete('/:id', auth_1.auth, isAdmin_1.isAdmin, orderController_1.deleteOrder);
exports.default = router;
