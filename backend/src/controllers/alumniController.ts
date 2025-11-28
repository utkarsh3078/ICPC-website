import { Request, Response } from 'express';
import * as svc from '../services/alumniService';
import { success, fail } from '../utils/response';

export const register = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const u = await svc.registerAlumni(email, req.body);
    success(res, u, 201);
  } catch (err: any) {
    fail(res, err.message);
  }
};

export const list = async (req: Request, res: Response) => {
  try {
    const l = await svc.listAlumni();
    success(res, l);
  } catch (err: any) {
    fail(res, err.message);
  }
};
