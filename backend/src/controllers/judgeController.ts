import { Request, Response } from "express";
import * as judge from "../services/judgeService";
import { success, fail } from "../utils/response";

export const submit = async (req: any, res: Response) => {
  try {
    const { source, language_id, stdin } = req.body;
    const data = await judge.submitToJudge0(source, language_id, stdin);
    success(res, data, 201);
  } catch (err: any) {
    fail(res, err.message);
  }
};

export const result = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const data = await judge.getJudge0Result(token);
    success(res, data);
  } catch (err: any) {
    fail(res, err.message);
  }
};
