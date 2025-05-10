import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export const optionalAuth = async (req: any, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { _id: string };
      const user = await User.findById(decoded._id);
      if (user) {
        req.user = {
          _id: user._id.toString(),
          role: user.role,
          name: user.name,
          email: user.email
        };
      }
    }
    next();
  } catch (error) {
    // If token is invalid, treat as guest
    next();
  }
}; 