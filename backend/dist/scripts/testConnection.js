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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const testConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        console.error('MONGODB_URI is not defined in environment variables');
        process.exit(1);
    }
    console.log('Testing MongoDB connection...');
    console.log('Connection string format check:');
    console.log('- Protocol:', mongoUri.startsWith('mongodb://') ? '✓' : '✗');
    console.log('- Host present:', mongoUri.includes('://') ? '✓' : '✗');
    console.log('- Database name present:', mongoUri.includes('/') ? '✓' : '✗');
    try {
        yield mongoose_1.default.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log('\nSuccessfully connected to MongoDB');
        console.log('Connection state:', mongoose_1.default.connection.readyState);
        console.log('Database name:', mongoose_1.default.connection.name);
        // Test a simple operation
        const collections = yield mongoose_1.default.connection.db.listCollections().toArray();
        console.log('Available collections:', collections.map(c => c.name));
    }
    catch (err) {
        const error = err;
        console.error('\nConnection Error Details:');
        console.error('Error message:', error.message);
        if (error.message.includes('ECONNREFUSED')) {
            console.error('\nConnection refused. Please check:');
            console.error('1. MongoDB server is running');
            console.error('2. MongoDB is listening on the correct port');
            console.error('3. No firewall is blocking the connection');
        }
        else if (error.message.includes('ENOTFOUND')) {
            console.error('\nHostname not found. Please check:');
            console.error('1. MongoDB host address is correct');
            console.error('2. Network connectivity');
        }
        else if (error.message.includes('ETIMEDOUT')) {
            console.error('\nConnection timed out. Please check:');
            console.error('1. Network connection');
            console.error('2. Firewall settings');
        }
    }
    finally {
        yield mongoose_1.default.disconnect();
        process.exit(0);
    }
});
testConnection();
