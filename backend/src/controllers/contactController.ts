import { Request, Response } from 'express';
import User from '../models/User';
import { sendContactMessage } from '../services/emailService';
import ContactUs from '../models/ContactUs';

export const contactUs = async (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  try {
    // Store in database
    await ContactUs.create({ name, email, subject, message });

    const adminUsers = await User.find({ role: 'admin' });
    if (adminUsers.length === 0) {
      return res.status(500).json({ message: 'No admin users found.' });
    }
    const adminEmails = adminUsers.map(admin => admin.email);
    await sendContactMessage({ name, email, subject, message }, adminEmails);
    res.status(200).json({ message: 'Your message has been sent. Thank you for contacting us!' });
  } catch (error) {
    console.error('Error in contactUs:', error);
    res.status(500).json({ message: 'Failed to send your message. Please try again later.' });
  }
}; 