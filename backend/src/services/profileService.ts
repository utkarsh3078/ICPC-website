import prisma from '../models/prismaClient';

export const upsertProfile = async (userId: string, payload: any) => {
  const existing = await prisma.profile.findUnique({ where: { userId } });
  if (existing) {
    return prisma.profile.update({ where: { id: existing.id }, data: payload });
  }
  return prisma.profile.create({ data: { ...payload, userId } });
};

export const getProfile = async (userId: string) => {
  return prisma.profile.findUnique({ where: { userId } });
};
