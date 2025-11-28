import prisma from '../models/prismaClient';
import { verifyLeetCode, verifyCodeforces } from '../utils/verifier';

export const createTask = async (data: any) => {
  return prisma.task.create({ data });
};

export const assignTask = async (taskId: string, userId: string) => {
  return prisma.task.update({ where: { id: taskId }, data: { assignedTo: userId } });
};

export const submitTask = async (taskId: string, userId: string, link: string) => {
  return prisma.submission.create({ data: { taskId, userId, link } });
};

// Auto-verification: tries to detect LC/CF links and mark verified accordingly.
export const verifySubmission = async (submissionId: string) => {
  const submission = await prisma.submission.findUnique({ where: { id: submissionId } });
  if (!submission) throw new Error('Submission not found');

  const link = submission.link || '';
  let verified = false;
  let points = 0;

  try {
    if (await verifyLeetCode(link)) {
      verified = true;
      points = 10;
    } else if (await verifyCodeforces(link)) {
      verified = true;
      points = 12;
    }
  } catch (err) {
    console.error('Verification error', err);
  }

  const sub = await prisma.submission.update({ where: { id: submissionId }, data: { verified, points } });
  if (verified) {
    // Optionally update user's points / streaks in profile or a separate table (not implemented yet)
  }
  return sub;
};
