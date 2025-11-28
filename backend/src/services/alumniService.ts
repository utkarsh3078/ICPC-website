import prisma from '../models/prismaClient';
import bcrypt from 'bcrypt';

export const registerAlumni = async (email: string, payload: any) => {
  const hashed = await bcrypt.hash(payload.password, 10);
  const user = await prisma.user.create({ data: { email, password: hashed, role: 'ALUMNI', approved: false } });
  return user;
};

export const listAlumni = async () => prisma.user.findMany({ where: { role: 'ALUMNI', approved: true } });
