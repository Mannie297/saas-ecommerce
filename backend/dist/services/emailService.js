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
exports.sendOrderNotification = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const handlebars_1 = __importDefault(require("handlebars"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
let transporter = null;
// Validate SMTP configuration
const validateSmtpConfig = () => {
    const requiredEnvVars = ['SMTP_USER', 'SMTP_PASS'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
        console.warn('SMTP configuration is incomplete. Email notifications will be disabled.');
        return false;
    }
    return true;
};
// Create reusable transporter
const createTransporter = () => {
    if (!validateSmtpConfig()) {
        return null;
    }
    const config = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    };
    console.log('SMTP Configuration:', {
        host: config.host,
        port: config.port,
        secure: config.secure,
        user: config.auth.user,
        hasPassword: !!config.auth.pass
    });
    return nodemailer_1.default.createTransport(config);
};
// Initialize transporter only when needed
const getTransporter = () => {
    if (!transporter) {
        transporter = createTransporter();
    }
    return transporter;
};
// Load email template
const loadTemplate = (templateName) => {
    const templatePath = path_1.default.join(__dirname, '../templates', `${templateName}.hbs`);
    const template = fs_1.default.readFileSync(templatePath, 'utf-8');
    return handlebars_1.default.compile(template);
};
// Format currency
handlebars_1.default.registerHelper('formatCurrency', (value) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value);
});
// Format date
handlebars_1.default.registerHelper('formatDate', (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
});
const sendOrderNotification = (order, adminEmail) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transporter = getTransporter();
        if (!transporter) {
            console.warn('Email service is not configured. Skipping order notification.');
            return;
        }
        const template = loadTemplate('orderNotification');
        const html = template({
            orderNumber: order._id,
            orderDate: order.date,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            items: order.items,
            total: order.total,
            shippingAddress: order.shippingAddress,
        });
        const mailOptions = {
            from: process.env.SMTP_FROM || 'noreply@yourstore.com',
            to: adminEmail,
            subject: `New Order #${order._id} Received`,
            html,
        };
        yield transporter.sendMail(mailOptions);
        console.log(`Order notification email sent to ${adminEmail}`);
    }
    catch (error) {
        console.error('Error sending order notification email:', error);
        // Don't throw the error, just log it
        console.warn('Continuing without email notification');
    }
});
exports.sendOrderNotification = sendOrderNotification;
