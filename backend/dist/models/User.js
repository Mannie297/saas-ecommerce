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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 7
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
}, {
    timestamps: true
});
// Hash the password before saving
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isModified('password')) {
            try {
                const salt = yield bcryptjs_1.default.genSalt(10);
                this.password = yield bcryptjs_1.default.hash(this.password, salt);
            }
            catch (error) {
                console.error('Error hashing password:', error);
                throw error;
            }
        }
        next();
    });
});
// Generate auth token
userSchema.methods.generateAuthToken = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error('JWT_SECRET is not set in environment variables');
            throw new Error('Server configuration error');
        }
        try {
            const token = jsonwebtoken_1.default.sign({
                _id: this._id.toString(),
                email: this.email,
                role: this.role
            }, secret, { expiresIn: '7d' });
            return token;
        }
        catch (error) {
            console.error('Error generating auth token:', error);
            throw error;
        }
    });
};
// Compare password
userSchema.methods.comparePassword = function (password) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!password) {
            console.error('No password provided for comparison');
            return false;
        }
        if (!this.password) {
            console.error('No stored password found for user');
            return false;
        }
        try {
            const isMatch = yield bcryptjs_1.default.compare(password, this.password);
            console.log('Password comparison result:', {
                isMatch,
                providedLength: password.length,
                storedLength: this.password.length
            });
            return isMatch;
        }
        catch (error) {
            console.error('Error comparing passwords:', error);
            return false;
        }
    });
};
const User = mongoose_1.default.model('User', userSchema);
exports.default = User;
