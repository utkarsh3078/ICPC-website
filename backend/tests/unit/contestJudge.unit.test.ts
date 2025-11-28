import MockAdapter from "axios-mock-adapter";
import axios from "axios";

// Mock the prisma client module
jest.mock("../../src/models/prismaClient", () => {
  return {
    __esModule: true,
    default: {
      contestSubmission: {
        create: jest.fn(async (data: any) => ({ id: "sub-1", ...data.data })),
        findMany: jest.fn(async () => []),
        update: jest.fn(async (args: any) => ({
          id: args.where.id,
          ...args.data,
        })),
      },
      contest: {
        findUnique: jest.fn(async () => ({ id: "contest-1", results: [] })),
        update: jest.fn(async (args: any) => ({
          id: args.where.id,
          ...args.data,
        })),
      },
      user: {
        findUnique: jest.fn(async () => ({
          id: "user-1",
          email: "test@local",
        })),
      },
    },
  };
});

jest.mock("../../src/services/judgeService", () => ({
  submitToJudge0: jest.fn(async () => ({ token: "fake-token" })),
  getJudge0Result: jest.fn(async () => ({
    status: { id: 3, description: "Accepted" },
    stdout: "OK",
  })),
}));

import * as contestJudge from "../../src/services/contestJudgeService";
import prisma from "../../src/models/prismaClient";

describe("ContestJudgeService (unit - mocked prisma & judge)", () => {
  let mock: MockAdapter;
  beforeAll(() => {
    mock = new MockAdapter(axios);
  });
  afterAll(() => {
    mock.restore();
  });

  test("submitContestCode creates a contestSubmission", async () => {
    const sub = await contestJudge.submitContestCode(
      "contest-1",
      0,
      "user-1",
      "print(1)",
      71
    );
    expect(sub).toBeDefined();
    expect(
      (prisma.contestSubmission.create as any).mock.calls.length
    ).toBeGreaterThan(0);
    expect(sub.status).toBe("PENDING");
  });

  test("pollPendingSubmissions updates submission with judge result", async () => {
    // prepare a fake pending return from findMany
    (prisma.contestSubmission.findMany as any).mockResolvedValueOnce([
      {
        id: "sub-1",
        contestId: "contest-1",
        token: "fake-token",
        userId: "user-1",
        problemIdx: 0,
        status: "PENDING",
      },
    ]);

    await contestJudge.pollPendingSubmissions();

    expect(
      (prisma.contestSubmission.update as any).mock.calls.length
    ).toBeGreaterThan(0);
    expect((prisma.contest.update as any).mock.calls.length).toBeGreaterThan(0);
  });
});
