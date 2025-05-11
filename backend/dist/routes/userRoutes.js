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
const express_1 = __importDefault(require("express"));
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const isAdmin_1 = require("../middleware/isAdmin");
const router = express_1.default.Router();
// Register a new user
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        const user = new User_1.default({ name, email, password });
        yield user.save();
        const token = yield user.generateAuthToken();
        res.status(201).json({ user, token });
    }
    catch (error) {
        res.status(400).json({ message: 'Error registering user' });
    }
}));
// Login user
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        console.log('Login attempt:', { email, password: password ? '****' : undefined });
        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required',
                details: { email: !email, password: !password }
            });
        }
        const user = yield User_1.default.findOne({ email });
        console.log('User found:', user ? {
            email: user.email,
            role: user.role,
            hasPassword: !!user.password
        } : 'Not found');
        if (!user) {
            return res.status(401).json({
                message: 'Invalid login credentials',
                details: 'User not found'
            });
        }
        const isMatch = yield user.comparePassword(password);
        console.log('Password match:', isMatch);
        if (!isMatch) {
            return res.status(401).json({
                message: 'Invalid login credentials',
                details: 'Password does not match'
            });
        }
        const token = yield user.generateAuthToken();
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };
        console.log('Login successful:', {
            userId: user._id,
            role: user.role,
            tokenGenerated: !!token
        });
        res.json({ user: userResponse, token });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            message: 'Error logging in',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
// Get user profile
router.get('/profile', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = yield User_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching profile' });
    }
}));
// Admin-only: Get all users for export
router.get('/', auth_1.auth, isAdmin_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield User_1.default.find({}, '_id name email role');
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
}));
exports.default = router;
