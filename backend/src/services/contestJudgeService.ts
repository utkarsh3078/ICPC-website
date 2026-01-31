import prisma from "../models/prismaClient";
import * as judge from "./judgeService";
import submissionEventService from "./submissionEventService";

// Test case result interface
interface TestCaseResult {
  passed: boolean;
  index: number;
  input?: string;
  expected?: string;
  actual?: string;
  time?: string;
  memory?: number;
  error?: string;
  isHidden?: boolean;
}

// Run code result interface
interface RunCodeResult {
  allPassed: boolean;
  passedCount: number;
  totalCount: number;
  firstFailed: TestCaseResult | null;
  time?: string;
  memory?: number;
  compileError?: string;
}

// Problem interface for type safety
interface Problem {
  title: string;
  description: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  tags?: string[];
  constraints?: { timeLimit?: number; memoryLimit?: number };
  sampleTestCases?: { input: string; output: string }[];
  hiddenTestCases?: { input: string; output: string }[];
  // Legacy support
  testCases?: { input: string; output: string }[];
}

/**
 * Run code against sample test cases only (synchronous)
 * Used for "Run Code" button - doesn't create a submission record
 */
export const runContestCode = async (
  contestId: string,
  problemIdx: number,
  source: string,
  language_id: number,
): Promise<RunCodeResult> => {
  // Get contest and problem
  const contest = await prisma.contest.findUnique({ where: { id: contestId } });
  if (!contest) throw new Error("Contest not found");

  const problems = (contest.problems as unknown as Problem[]) || [];
  const problem = problems[problemIdx];
  if (!problem) throw new Error("Problem not found");

  // Get sample test cases (use sampleTestCases or fall back to testCases for legacy)
  const sampleTestCases = problem.sampleTestCases || problem.testCases || [];
  if (sampleTestCases.length === 0) {
    throw new Error("No sample test cases available for this problem");
  }

  // Get time limit from problem constraints (default 2 seconds)
  const timeLimit = problem.constraints?.timeLimit || 2;

  const results: TestCaseResult[] = [];
  let firstFailed: TestCaseResult | null = null;
  let maxTime: string | undefined;
  let maxMemory: number | undefined;

  // Run against each sample test case
  for (let i = 0; i < sampleTestCases.length; i++) {
    const tc = sampleTestCases[i];
    try {
      const result = await judge.runWithTestCase(
        source,
        language_id,
        tc.input,
        tc.output,
        timeLimit,
      );

      // Status ID 3 = Accepted
      const passed = result.status?.id === 3;
      const tcResult: TestCaseResult = {
        passed,
        index: i,
        input: tc.input,
        expected: tc.output,
        actual: result.stdout?.trim() || "",
        time: result.time,
        memory: result.memory,
        isHidden: false,
      };

      // Check for compilation error (status 6)
      if (result.status?.id === 6) {
        return {
          allPassed: false,
          passedCount: 0,
          totalCount: sampleTestCases.length,
          firstFailed: null,
          compileError: result.compile_output || "Compilation error",
        };
      }

      // Check for runtime error (status 11) or other errors
      if (result.status?.id >= 5 && result.status?.id !== 6) {
        tcResult.error =
          result.stderr || result.status?.description || "Runtime error";
      }

      results.push(tcResult);

      // Track first failure
      if (!passed && !firstFailed) {
        firstFailed = tcResult;
      }

      // Track max time and memory
      if (result.time) {
        const timeNum = parseFloat(result.time);
        if (!maxTime || timeNum > parseFloat(maxTime)) {
          maxTime = result.time;
        }
      }
      if (result.memory) {
        if (!maxMemory || result.memory > maxMemory) {
          maxMemory = result.memory;
        }
      }
    } catch (err: any) {
      // Judge0 error
      const tcResult: TestCaseResult = {
        passed: false,
        index: i,
        input: tc.input,
        expected: tc.output,
        error: err.message || "Execution error",
        isHidden: false,
      };
      results.push(tcResult);
      if (!firstFailed) firstFailed = tcResult;
    }
  }

  const passedCount = results.filter((r) => r.passed).length;

  return {
    allPassed: passedCount === sampleTestCases.length,
    passedCount,
    totalCount: sampleTestCases.length,
    firstFailed,
    time: maxTime,
    memory: maxMemory,
  };
};

/**
 * Submit code for judging against ALL test cases (sample + hidden)
 * Creates a submission record and submits to Judge0 asynchronously
 */
export const submitContestCode = async (
  contestId: string,
  problemIdx: number,
  userId: string,
  source: string,
  language_id: number,
) => {
  // Get contest and problem
  const contest = await prisma.contest.findUnique({ where: { id: contestId } });
  if (!contest) throw new Error("Contest not found");

  const problems = (contest.problems as unknown as Problem[]) || [];
  const problem = problems[problemIdx];
  if (!problem) throw new Error("Problem not found");

  // Get all test cases (sample + hidden)
  const sampleTestCases = problem.sampleTestCases || problem.testCases || [];
  const hiddenTestCases = problem.hiddenTestCases || [];
  const allTestCases = [
    ...sampleTestCases.map((tc) => ({ ...tc, isHidden: false })),
    ...hiddenTestCases.map((tc) => ({ ...tc, isHidden: true })),
  ];

  if (allTestCases.length === 0) {
    throw new Error("No test cases available for this problem");
  }

  // Get time limit from problem constraints (default 2 seconds)
  const timeLimit = problem.constraints?.timeLimit || 2;

  // Submit each test case to Judge0 asynchronously
  const tokens: string[] = [];
  for (const tc of allTestCases) {
    const res = await judge.submitWithTestCase(
      source,
      language_id,
      tc.input,
      tc.output,
      timeLimit,
    );
    if (res.token) {
      tokens.push(res.token);
    }
  }

  // Create submission record with all tokens
  const submission = await prisma.contestSubmission.create({
    data: {
      contestId,
      problemIdx,
      userId,
      token: tokens[0] || null, // Keep first token for backward compatibility
      tokens,
      status: "PENDING",
      result: {
        totalTestCases: allTestCases.length,
        sampleCount: sampleTestCases.length,
        hiddenCount: hiddenTestCases.length,
        testCaseInfo: allTestCases.map((tc, i) => ({
          index: i,
          isHidden: tc.isHidden,
        })),
      },
    },
  });

  return submission;
};

/**
 * Poll pending submissions and update their status
 * Handles both legacy single-token and new multi-token submissions
 * @returns Object with count of processed submissions
 */
export const pollPendingSubmissions = async (): Promise<{
  processedCount: number;
}> => {
  const pending = await prisma.contestSubmission.findMany({
    where: { status: "PENDING" },
    take: 20,
  });

  let processedCount = 0;

  for (const s of pending) {
    try {
      // Check if this is a multi-token submission (new system) or single-token (legacy)
      const tokens =
        s.tokens && s.tokens.length > 0 ? s.tokens : s.token ? [s.token] : [];

      if (tokens.length === 0) continue;

      // Fetch results for all tokens
      const testCaseResults: TestCaseResult[] = [];
      let allFinished = true;
      let hasCompileError = false;
      let compileError: string | null = null;

      // Get test case info from existing result
      const existingResult = (s.result as any) || {};
      const testCaseInfo = existingResult.testCaseInfo || [];

      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        let result: any = null;
        let attempts = 0;
        const maxAttempts = 3;
        const baseDelay = 500;

        while (attempts < maxAttempts) {
          attempts++;
          try {
            result = await judge.getJudge0Result(token);
            break;
          } catch (err) {
            const wait = baseDelay * Math.pow(2, attempts - 1);
            await new Promise((r) => setTimeout(r, wait));
          }
        }

        if (!result) {
          allFinished = false;
          continue;
        }

        const statusId = result?.status?.id || 0;

        // 1 = In Queue, 2 = Processing
        if (statusId === 1 || statusId === 2) {
          allFinished = false;
          continue;
        }

        // Check for compilation error (only need to check once)
        if (statusId === 6 && !hasCompileError) {
          hasCompileError = true;
          compileError = result.compile_output || "Compilation error";
        }

        const isHidden =
          testCaseInfo[i]?.isHidden ?? i >= (existingResult.sampleCount || 0);
        const passed = statusId === 3; // Accepted

        testCaseResults.push({
          passed,
          index: i,
          time: result.time,
          memory: result.memory,
          actual: result.stdout?.trim() || "",
          error:
            statusId >= 5 && statusId !== 6
              ? result.stderr || result.status?.description
              : undefined,
          isHidden,
        });
      }

      // Only update if all test cases have finished
      if (!allFinished) continue;

      // Calculate aggregated result
      const passedCount = testCaseResults.filter((r) => r.passed).length;
      const totalCount = tokens.length;
      const allPassed = passedCount === totalCount;
      const firstFailed = testCaseResults.find((r) => !r.passed) || null;

      // Determine final status
      let finalStatus: string;
      if (hasCompileError) {
        finalStatus = "Compilation Error";
      } else if (allPassed) {
        finalStatus = "Accepted";
      } else {
        finalStatus = firstFailed?.error ? "Runtime Error" : "Wrong Answer";
      }

      // Calculate max time and memory
      const maxTime = testCaseResults.reduce((max, r) => {
        if (!r.time) return max;
        const t = parseFloat(r.time);
        return t > max ? t : max;
      }, 0);

      const maxMemory = testCaseResults.reduce((max, r) => {
        return r.memory && r.memory > max ? r.memory : max;
      }, 0);

      // Update submission with aggregated result
      const updatedSubmission = await prisma.contestSubmission.update({
        where: { id: s.id },
        data: {
          status: finalStatus,
          result: {
            ...existingResult,
            allPassed,
            passedCount,
            totalCount,
            testCaseResults,
            firstFailed: firstFailed
              ? {
                  ...firstFailed,
                  // Don't expose hidden test case details
                  input: firstFailed.isHidden ? undefined : firstFailed.input,
                  expected: firstFailed.isHidden
                    ? undefined
                    : firstFailed.expected,
                }
              : null,
            compileError,
            time: maxTime > 0 ? maxTime.toFixed(3) : undefined,
            memory: maxMemory > 0 ? maxMemory : undefined,
          },
        },
      });

      // Emit event for real-time updates
      submissionEventService.emitSubmissionUpdate(
        s.id,
        finalStatus,
        updatedSubmission.result,
      );

      // Append to contest.results for leaderboard
      const contest = await prisma.contest.findUnique({
        where: { id: s.contestId },
      });
      const resultsArr = (contest?.results as any[]) || [];
      resultsArr.push({
        submissionId: s.id,
        userId: s.userId,
        problemIdx: s.problemIdx,
        status: finalStatus,
        passedCount,
        totalCount,
        time: maxTime > 0 ? maxTime.toFixed(3) : null,
        memory: maxMemory > 0 ? maxMemory : null,
        createdAt: new Date(),
      });
      await prisma.contest.update({
        where: { id: s.contestId },
        data: { results: resultsArr },
      });

      processedCount++;
    } catch (err) {
      console.error("Polling error for submission", s.id, err);
    }
  }

  return { processedCount };
};
