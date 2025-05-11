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
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const testLogin = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/saas';
        yield mongoose_1.default.connect(mongoUri);
        console.log('Connected to MongoDB');
        // Test user credentials
        const testUser = {
            email: 'admin@example.com',
            password: 'admin123'
        };
        // Find or create user
        console.log('\n1. Finding or creating test user...');
        let user = yield User_1.default.findOne({ email: testUser.email });
        if (!user) {
            console.log('Creating test admin user...');
            user = new User_1.default({
                name: 'Admin User',
                email: testUser.email,
                password: testUser.password,
                role: 'admin'
            });
            yield user.save();
            console.log('Test admin user created:', {
                email: user.email,
                role: user.role,
                hasPassword: !!user.password
            });
        }
        else {
            console.log('Existing user found:', {
                email: user.email,
                role: user.role,
                hasPassword: !!user.password
            });
        }
        // Test password comparison
        console.log('\n2. Testing password comparison...');
        const isMatch = yield user.comparePassword(testUser.password);
        console.log('Password match:', isMatch);
        // Test token generation
        console.log('\n3. Testing token generation...');
        const token = yield user.generateAuthToken();
        console.log('Token generated:', !!token);
        if (token) {
            console.log('Token length:', token.length);
        }
        // Test full login flow
        console.log('\n4. Testing full login flow...');
        const loginUser = yield User_1.default.findOne({ email: testUser.email });
        if (loginUser) {
            const passwordMatch = yield loginUser.comparePassword(testUser.password);
            if (passwordMatch) {
                const authToken = yield loginUser.generateAuthToken();
                console.log('Login successful:', {
                    userId: loginUser._id,
                    role: loginUser.role,
                    tokenGenerated: !!authToken
                });
            }
            else {
                console.log('Login failed: Password does not match');
            }
        }
        else {
            console.log('Login failed: User not found');
        }
    }
    catch (error) {
        console.error('Test failed:', error);
    }
    finally {
        yield mongoose_1.default.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
});
// Run the test
testLogin();
