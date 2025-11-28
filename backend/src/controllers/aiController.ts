import { Request, Response } from 'express';
import { chat } from '../services/aiService';
import { success, fail } from '../utils/response';

export const chatRoute = async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    const resp = await chat(prompt);
    success(res, resp);
  } catch (err: any) {
    fail(res, err.message);
  }
};
