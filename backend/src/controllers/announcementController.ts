import { Request, Response } from 'express';
import * as ann from '../services/announcementService';
import { success, fail } from '../utils/response';

export const create = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const a = await ann.createAnnouncement(data);
    success(res, a, 201);
  } catch (err: any) {
    fail(res, err.message);
  }
};

export const listAll = async (req: Request, res: Response) => {
  try {
    const a = await ann.listAnnouncements();
    success(res, a);
  } catch (err: any) {
    fail(res, err.message);
  }
};
