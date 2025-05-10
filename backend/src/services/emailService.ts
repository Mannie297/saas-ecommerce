import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';

let transporter: nodemailer.Transporter | null = null;

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

  return nodemailer.createTransport(config);
};

// Initialize transporter only when needed
const getTransporter = () => {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
};

// Load email template
const loadTemplate = (templateName: string) => {
  const templatePath = path.join(__dirname, '../templates', `${templateName}.hbs`);
  const template = fs.readFileSync(templatePath, 'utf-8');
  return handlebars.compile(template);
};

// Format currency
handlebars.registerHelper('formatCurrency', (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
});

// Format date
handlebars.registerHelper('formatDate', (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

interface OrderItem {
  productId: {
    name: string;
    price: number;
  };
  quantity: number;
  price: number;
}

interface OrderDetails {
  _id: string;
  items: OrderItem[];
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  customerName: string;
  customerEmail: string;
  date: Date;
}

export const sendOrderNotification = async (order: OrderDetails, adminEmail: string) => {
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

    await transporter.sendMail(mailOptions);
    console.log(`Order notification email sent to ${adminEmail}`);
  } catch (error) {
    console.error('Error sending order notification email:', error);
    // Don't throw the error, just log it
    console.warn('Continuing without email notification');
  }
}; 