import prisma from '../models/prismaClient';

export const createAnnouncement = async (data: any) => {
  return prisma.session.create({ data }); // reuse session table as simple announcement store placeholder
};

export const listAnnouncements = async () => {
  return prisma.session.findMany({ orderBy: { createdAt: 'desc' } });
};
