import { Request, Response } from "express";
import * as svc from "../services/contestService";
import { success, fail } from "../utils/response";
import * as judgeSvc from "../services/contestJudgeService";

// Simple in-memory rate limiter for run code (10 runs per minute per user)
const runCodeRateLimit = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;

const checkRateLimit = (userId: string): { allowed: boolean; retryAfter?: number } => {
  const now = Date.now();
  const userRequests = runCodeRateLimit.get(userId) || [];
  
  // Remove requests outside the window
  const validRequests = userRequests.filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
  );
  
  if (validRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    const oldestRequest = validRequests[0];
    const retryAfter = Math.ceil((oldestRequest + RATE_LIMIT_WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfter };
  }
  
  // Add current request
  validRequests.push(now);
  runCodeRateLimit.set(userId, validRequests);
  
  return { allowed: true };
};

export const create = async (req: Request, res: Response) => {
  try {
    const c = await svc.createContest(req.body);
    success(res, c, 201);
  } catch (err: any) {
    fail(res, err.message);
  }
};

export const addProblem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const p = await svc.addProblem(id, req.body);
    success(res, p);
  } catch (err: any) {
    fail(res, err.message);
  }
};

export const list = async (req: Request, res: Response) => {
  try {
    const list = await svc.listContests();
    success(res, list);
  } catch (err: any) {
    fail(res, err.message);
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const contest = await svc.getContest(id);
    if (!contest) return fail(res, "Contest not found", 404);
    success(res, contest);
  } catch (err: any) {
    fail(res, err.message);
  }
};

export const deleteContest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await svc.deleteContest(id);
    success(res, { message: "Contest deleted successfully" });
  } catch (err: any) {
    fail(res, err.message);
  }
};

export const saveResults = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const results = req.body;
    const c = await svc.saveResults(id, results);
    success(res, c);
  } catch (err: any) {
    fail(res, err.message);
  }
};

export const history = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const h = await svc.userHistory(userId);
    success(res, h);
  } catch (err: any) {
    fail(res, err.message);
  }
};

export const submit = async (req: any, res: Response) => {
  try {
    const contestId = req.params.id;
    const { source, language_id, problemIdx } = req.body;
    const userId = req.user.id;
    const s = await judgeSvc.submitContestCode(
      contestId,
      problemIdx,
      userId,
      source,
      language_id
    );
    success(res, s, 201);
  } catch (err: any) {
    fail(res, err.message);
  }
};

export const submissions = async (req: any, res: Response) => {
  try {
    const { id } = req.params; // contest id
    const list = await svc.getContestSubmissions(id);
    success(res, list);
  } catch (err: any) {
    fail(res, err.message);
  }
};

export const mySubmissions = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const list = await svc.getUserSubmissions(userId);
    success(res, list);
  } catch (err: any) {
    fail(res, err.message);
  }
};

export const myContestSubmissions = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // contest id
    const list = await svc.getUserContestSubmissions(id, userId);
    success(res, list);
  } catch (err: any) {
    fail(res, err.message);
  }
};

export const getSubmission = async (req: any, res: Response) => {
  try {
    const { submissionId } = req.params;
    const s = await svc.getSubmissionById(submissionId);
    if (!s) return fail(res, "Submission not found", 404);

    // allow owners and admins to view
    const requester = req.user;
    if (requester.role !== "ADMIN" && requester.id !== s.userId)
      return fail(res, "Forbidden", 403);

    success(res, s);
  } catch (err: any) {
    fail(res, err.message);
  }
};

/**
 * Run code against sample test cases only (synchronous)
 * Rate limited to 10 runs per minute per user
 */
export const runCode = async (req: any, res: Response) => {
  try {
    const contestId = req.params.id;
    const { source, language_id, problemIdx } = req.body;
    const userId = req.user.id;

    // Check rate limit
    const rateLimitResult = checkRateLimit(userId);
    if (!rateLimitResult.allowed) {
      res.set("Retry-After", String(rateLimitResult.retryAfter));
      return fail(
        res,
        `Rate limit exceeded. Try again in ${rateLimitResult.retryAfter} seconds.`,
        429
      );
    }

    // Verify contest exists and is active
    const contest = await svc.getContest(contestId);
    if (!contest) {
      return fail(res, "Contest not found", 404);
    }

    // Check if contest has started
    const now = new Date();
    if (contest.startTime > now) {
      return fail(res, "Contest has not started yet", 400);
    }

    // Check if contest has ended (startTime + timer minutes)
    const endTime = new Date(contest.startTime.getTime() + contest.timer * 60 * 1000);
    if (now > endTime) {
      return fail(res, "Contest has ended", 400);
    }

    // Run code against sample test cases
    const result = await judgeSvc.runContestCode(
      contestId,
      problemIdx,
      source,
      language_id
    );

    success(res, result);
  } catch (err: any) {
    fail(res, err.message);
  }
};
