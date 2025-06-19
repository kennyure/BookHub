import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number
        username: string
      }
    }
  }
}

const auth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res
        .status(401)
        .json({ message: 'No authentication token, access denied' });
      return;
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number
      username: string
    };
    req.user = verified;
    next();
  } catch (err) {
    res
      .status(401)
      .json({ message: 'Token verification failed, authorization denied' });
  }
};

export default auth;
