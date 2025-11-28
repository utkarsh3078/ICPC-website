import { Request, Response } from 'express';
import * as svc from '../services/gamificationService';
import { success, fail } from '../utils/response';

export const leaderboard = async (req: Request, res: Response) => {
  try {
    const period = (req.query.period as any) || 'all';
    const list = await svc.leaderboard(period);
    success(res, list);
  } catch (err: any) {
    fail(res, err.message);
  }
};

export const badges = async (req: Request, res: Response) => {
  try {
    const list = await svc.listBadges();
    success(res, list);
  } catch (err: any) {
    fail(res, err.message);
  }
};

export const userBadges = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const earned = await svc.earnedBadgesForUser(userId);
    success(res, earned);
  } catch (err: any) {
    fail(res, err.message);
  }
};
