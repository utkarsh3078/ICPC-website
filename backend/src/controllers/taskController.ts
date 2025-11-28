import { Request, Response } from 'express';
import * as taskService from '../services/taskService';
import { success, fail } from '../utils/response';

export const create = async (req: Request, res: Response) => {
  try {
    const task = await taskService.createTask(req.body);
    success(res, task, 201);
  } catch (err: any) {
    fail(res, err.message);
  }
};

export const assign = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const { userId } = req.body;
    const task = await taskService.assignTask(taskId, userId);
    success(res, task);
  } catch (err: any) {
    fail(res, err.message);
  }
};

export const submit = async (req: any, res: Response) => {
  try {
    const { taskId } = req.params;
    const { link } = req.body;
    const sub = await taskService.submitTask(taskId, req.user.id, link);
    // auto-verify stub
    await taskService.verifySubmission(sub.id);
    success(res, sub, 201);
  } catch (err: any) {
    fail(res, err.message);
  }
};
