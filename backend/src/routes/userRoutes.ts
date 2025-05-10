import express from 'express';
import { Request, Response } from 'express';
import User from '../models/User';
import { auth } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';

const router = express.Router();

// Register a new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const user = new User({ name, email, password });
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ message: 'Error registering user' });
  }
});

// Login user
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, password: password ? '****' : undefined });
    
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required',
        details: { email: !email, password: !password }
      });
    }

    const user = await User.findOne({ email });
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

    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      return res.status(401).json({ 
        message: 'Invalid login credentials',
        details: 'Password does not match'
      });
    }

    const token = await user.generateAuthToken();
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
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Error logging in',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get user profile
router.get('/profile', auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Admin-only: Get all users for export
router.get('/', auth, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find({}, '_id name email role');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

export default router; 