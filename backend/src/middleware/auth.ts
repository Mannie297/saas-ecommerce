import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    _id: string;
    role?: 'user' | 'admin';
    name: string;
    email: string;
  };
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { _id: string };
    const user = await User.findById(decoded._id);

    if (!user) {
      throw new Error();
    }

    req.user = {
      _id: user._id.toString(),
      role: user.role,
      name: user.name,
      email: user.email
    };
    console.log('auth middleware - req.user:', req.user);
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
}; 