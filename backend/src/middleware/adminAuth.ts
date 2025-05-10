import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const adminAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
}; 