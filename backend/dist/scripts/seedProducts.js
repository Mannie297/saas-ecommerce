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
const Product_1 = __importDefault(require("../models/Product"));
const products_1 = require("../data/products");
// Load environment variables
dotenv_1.default.config();
const seedProducts = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }
        // Add connection options
        const options = {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4
        };
        console.log('Attempting to connect to MongoDB...');
        yield mongoose_1.default.connect(mongoUri, options);
        console.log('Connected to MongoDB');
        // Clear existing products
        yield Product_1.default.deleteMany({});
        console.log('Cleared existing products');
        // Insert new products
        const insertedProducts = yield Product_1.default.insertMany(products_1.products);
        console.log(`Successfully seeded ${insertedProducts.length} products`);
        // Log the product IDs for reference
        console.log('Product IDs:');
        insertedProducts.forEach(product => {
            console.log(`${product.name}: ${product._id}`);
        });
    }
    catch (error) {
        console.error('Error seeding products:', error);
        if (error instanceof Error) {
            console.error('Error details:', error.message);
        }
    }
    finally {
        // Close the database connection
        yield mongoose_1.default.connection.close();
        console.log('Database connection closed');
    }
});
// Run the seed function
seedProducts();
