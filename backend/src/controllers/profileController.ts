import { Request, Response } from 'express';
import * as profileService from '../services/profileService';
import { success, fail } from '../utils/response';

export const upsert = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const payload = req.body;
    const profile = await profileService.upsertProfile(userId, payload);
    success(res, profile);
  } catch (err: any) {
    fail(res, err.message);
  }
};

export const get = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const profile = await profileService.getProfile(userId);
    success(res, profile);
  } catch (err: any) {
    fail(res, err.message);
  }
};
