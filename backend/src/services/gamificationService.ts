import prisma from '../models/prismaClient';
import badges from '../utils/badges.json';

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function startOfSemester(d: Date) {
  const month = d.getMonth();
  const semStartMonth = month < 6 ? 0 : 6; // Jan-Jun, Jul-Dec
  return new Date(d.getFullYear(), semStartMonth, 1);
}

export const leaderboard = async (period: 'month' | 'semester' | 'all' = 'all') => {
  const now = new Date();
  let where: any = { verified: true };
  if (period === 'month') where.createdAt = { gte: startOfMonth(now) };
  if (period === 'semester') where.createdAt = { gte: startOfSemester(now) };

  const rows = await prisma.submission.groupBy({
    by: ['userId'],
    where,
    _sum: { points: true },
    orderBy: { _sum: { points: 'desc' } },
    take: 100,
  });

  // enrich with user email/profile
  const result = await Promise.all(
    rows.map(async (r, idx) => {
      const user = await prisma.user.findUnique({ where: { id: r.userId } });
      const profile = await prisma.profile.findUnique({ where: { userId: r.userId } });
      return {
        position: idx + 1,
        userId: r.userId,
        email: user?.email,
        name: profile?.name || null,
        points: r._sum.points || 0,
      };
    })
  );
  return result;
};

export const listBadges = async () => {
  // return static rules for now
  return badges;
};

export const earnedBadgesForUser = async (userId: string) => {
  // simple implementation: check first_submit and basic leaderboard membership
  const subsCount = await prisma.submission.count({ where: { userId, verified: true } });
  const earned: any[] = [];
  const rules: any[] = badges as any;
  for (const r of rules) {
    const rule = r.rule;
    if (rule.type === 'submission_count') {
      if (subsCount >= (rule.min || 1)) earned.push(r);
    }
    if (rule.type === 'leaderboard_position' && rule.period === 'month') {
      const board = await leaderboard('month');
      const pos = board.findIndex((b: any) => b.userId === userId);
      if (pos >= 0 && pos + 1 <= rule.position) earned.push(r);
    }
    // streak rules require more tracking; left as placeholder
  }
  return earned;
};
