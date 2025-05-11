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
const readline_1 = __importDefault(require("readline"));
dotenv_1.default.config();
const rl = readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout
});
const question = (query) => {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
};
const createAdminUser = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/saas';
        yield mongoose_1.default.connect(mongoUri);
        console.log('Connected to MongoDB');
        // Get user details
        const name = yield question('Enter admin name: ');
        const email = yield question('Enter admin email: ');
        const password = yield question('Enter admin password (min 7 characters): ');
        // Validate input
        if (!name || !email || !password) {
            throw new Error('All fields are required');
        }
        if (password.length < 7) {
            throw new Error('Password must be at least 7 characters long');
        }
        // Check if user already exists
        const existingUser = yield User_1.default.findOne({ email });
        if (existingUser) {
            console.log('User already exists with this email');
            if (existingUser.role === 'admin') {
                console.log('User is already an admin');
            }
            else {
                const makeAdmin = yield question('Make this user an admin? (y/n): ');
                if (makeAdmin.toLowerCase() === 'y') {
                    existingUser.role = 'admin';
                    yield existingUser.save();
                    console.log('User has been made an admin');
                }
            }
        }
        else {
            // Create new admin user
            const user = new User_1.default({
                name,
                email,
                password,
                role: 'admin'
            });
            yield user.save();
            console.log('Admin user created successfully:', {
                name: user.name,
                email: user.email,
                role: user.role
            });
        }
    }
    catch (error) {
        console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
    }
    finally {
        yield mongoose_1.default.disconnect();
        rl.close();
        console.log('\nDisconnected from MongoDB');
    }
});
// Run the script
createAdminUser();
