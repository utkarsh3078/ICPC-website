import prisma from '../models/prismaClient';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

export const registerUser = async (email: string, password: string, role: string = 'STUDENT') => {
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, password: hashed, role: role as any } });
  return user;
};

export const approveUser = async (userId: string) => {
  return prisma.user.update({ where: { id: userId }, data: { approved: true } });
};

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid credentials');
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new Error('Invalid credentials');
  if (!user.approved) throw new Error('User not approved yet');
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  return { token, user };
};
