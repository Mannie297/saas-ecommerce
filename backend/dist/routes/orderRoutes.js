"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const auth_1 = require("../middleware/auth");
const isAdmin_1 = require("../middleware/isAdmin");
const router = (0, express_1.Router)();
// Public routes
router.post('/payment-intent', orderController_1.createPaymentIntent);
router.post('/', orderController_1.createOrder);
// Protected routes
router.get('/', auth_1.auth, orderController_1.getOrders);
router.get('/user', auth_1.auth, orderController_1.getUserOrders);
router.get('/:id', auth_1.auth, orderController_1.getOrder);
router.patch('/:id/status', auth_1.auth, isAdmin_1.isAdmin, orderController_1.updateOrderStatus);
router.delete('/:id', auth_1.auth, isAdmin_1.isAdmin, orderController_1.deleteOrder);
exports.default = router;
