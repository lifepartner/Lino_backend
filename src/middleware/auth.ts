import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utility/functions';
import { User } from '../models/user.models';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    console.log('Auth middleware - Authorization header:', req.header('Authorization'));
    console.log('Auth middleware - Token:', token ? 'present' : 'missing');
    
    if (!token) {
      console.log('Auth middleware - No token provided');
      return res.status(401).json({ 
        message: 'アクセストークンが必要です',
        code: 'token_missing'
      });
    }

    const decoded = verifyToken(token);
    console.log('Auth middleware - Token verification result:', decoded ? 'valid' : 'invalid');
    
    if (!decoded) {
      console.log('Auth middleware - Token verification failed');
      return res.status(401).json({ 
        message: '無効なトークンです',
        code: 'token_invalid'
      });
    }

    const user = await User.findById(decoded.userId).select('-__v');
    if (!user) {
      return res.status(401).json({ 
        message: 'ユーザーが見つかりません',
        code: 'user_not_found'
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({ 
        message: 'アカウントがブロックされています',
        code: 'account_blocked'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      message: '認証エラーが発生しました',
      code: 'auth_error'
    });
  }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return next(); // Continue without user
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return next(); // Continue without user
    }

    const user = await User.findById(decoded.userId).select('-__v');
    if (user && !user.isBlocked) {
      req.user = user;
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next(); // Continue without user
  }
}; 