import prisma from '../models/prismaClient';

export const createSession = async (data: any) => prisma.session.create({ data });
export const updateSession = async (id: string, data: any) => prisma.session.update({ where: { id }, data });
export const deleteSession = async (id: string) => prisma.session.delete({ where: { id } });
export const listSessions = async () => prisma.session.findMany({ orderBy: { date: 'desc' } });
export const registerForSession = async (sessionId: string, userId: string) => {
	const s = await prisma.session.findUnique({ where: { id: sessionId } });
	if (!s) throw new Error('Session not found');
	const attendees = (s.attendees as any[]) || [];
	if (!attendees.includes(userId)) attendees.push(userId);
	return prisma.session.update({ where: { id: sessionId }, data: { attendees } });
};

export const markAttendance = async (sessionId: string, userId: string, present: boolean) => {
	const s = await prisma.session.findUnique({ where: { id: sessionId } });
	if (!s) throw new Error('Session not found');
	const attendees = (s.attendees as any[]) || [];
	const index = attendees.findIndex((a: any) => a.userId === userId);
	if (index >= 0) {
		attendees[index] = { userId, present };
	} else {
		attendees.push({ userId, present });
	}
	return prisma.session.update({ where: { id: sessionId }, data: { attendees } });
};
