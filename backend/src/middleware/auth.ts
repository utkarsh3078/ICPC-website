import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../models/prismaClient';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

export interface AuthRequest extends Request {
  user?: any;
}

export const isAuthenticated = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'No token provided' });
  const token = auth.replace('Bearer ', '');
  try {
    const payload: any = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user || !user.approved) return res.status(403).json({ message: 'User not approved or not found' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Admin only' });
  next();
};

export const isAlumni = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  if (req.user.role !== 'ALUMNI') return res.status(403).json({ message: 'Alumni only' });
  next();
};
