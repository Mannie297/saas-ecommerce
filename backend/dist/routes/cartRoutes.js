"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cartController_1 = require("../controllers/cartController");
const optionalAuth_1 = require("../middleware/optionalAuth");
const router = express_1.default.Router();
// All cart routes are optional authenticated
// This means they will work for both authenticated and guest users
router.get('/', optionalAuth_1.optionalAuth, cartController_1.getCart);
router.post('/add', optionalAuth_1.optionalAuth, cartController_1.addToCart);
router.put('/update', optionalAuth_1.optionalAuth, cartController_1.updateCartItem);
router.delete('/remove/:productId', optionalAuth_1.optionalAuth, cartController_1.removeFromCart);
router.delete('/clear', optionalAuth_1.optionalAuth, cartController_1.clearCart);
exports.default = router;
