import prisma from "../models/prismaClient";
import * as judge from "./judgeService";

export const submitContestCode = async (
  contestId: string,
  problemIdx: number,
  userId: string,
  source: string,
  language_id: number
) => {
  // Submit to Judge0
  const res: any = await judge.submitToJudge0(source, language_id);
  const token =
    res?.token ||
    res?.raw?.token ||
    res?.raw?.token_id ||
    res?.raw?.submission_token ||
    null;

  const submission = await prisma.contestSubmission.create({
    data: {
      contestId,
      problemIdx,
      userId,
      token: token as any,
      status: "PENDING",
    },
  });

  return submission;
};

export const pollPendingSubmissions = async () => {
  const pending = await prisma.contestSubmission.findMany({
    where: { status: "PENDING" },
    take: 20,
  });
  for (const s of pending) {
    if (!s.token) continue;
    try {
      // Try fetching result with a few retries to handle transient errors
      let result: any = null;
      let attempts = 0;
      const maxAttempts = 3;
      const baseDelay = 500; // ms
      while (attempts < maxAttempts) {
        attempts++;
        try {
          result = await judge.getJudge0Result(s.token);
          break;
        } catch (err) {
          // transient; wait then retry
          const wait = baseDelay * Math.pow(2, attempts - 1);
          await new Promise((r) => setTimeout(r, wait));
        }
      }
      if (!result)
        throw new Error("Failed to fetch judge result after retries");
      // judge result has status object; 1 = In Queue, 2 = Processing
      const statusId = result?.status?.id || 0;
      const finished = statusId !== 1 && statusId !== 2;

      if (finished) {
        const statusDesc = result?.status?.description || `Status-${statusId}`;
        await prisma.contestSubmission.update({
          where: { id: s.id },
          data: {
            result: result as any,
            status: statusDesc,
          },
        });

        // append result to contest.results
        const contest = await prisma.contest.findUnique({
          where: { id: s.contestId },
        });
        const resultsArr = (contest?.results as any[]) || [];
        resultsArr.push({
          userId: s.userId,
          problemIdx: s.problemIdx,
          token: s.token,
          status: result?.status,
          stdout: result?.stdout,
          stderr: result?.stderr,
          time: result?.time,
          memory: result?.memory,
          createdAt: new Date(),
        });
        await prisma.contest.update({
          where: { id: s.contestId },
          data: { results: resultsArr },
        });
      }
    } catch (err) {
      console.error("Polling error for submission", s.id, err);
    }
  }
};
