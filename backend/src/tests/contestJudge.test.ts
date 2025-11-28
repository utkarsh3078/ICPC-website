import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import prisma from "../models/prismaClient";
import * as judge from "../services/judgeService";
import * as contestJudge from "../services/contestJudgeService";

// Note: these tests interact with the database defined in backend/.env.
// Ensure the DB is running and migrations have been applied before running tests.

describe("Contest judge flow (unit)", () => {
  const mock = new MockAdapter(axios);

  beforeAll(async () => {
    // create a sample contest and user to reference
    await prisma.user.upsert({
      where: { email: "test-user@local" },
      update: {},
      create: { email: "test-user@local", password: "x", approved: true },
    });
    await prisma.contest.createMany({
      data: [{ title: "Test Contest", problems: JSON.stringify([]) } as any],
      skipDuplicates: true,
    });
  });

  afterAll(async () => {
    // cleanup contest submissions created by tests
    await prisma.contestSubmission.deleteMany({ where: {} });
    await prisma.contest.deleteMany({ where: { title: "Test Contest" } });
    await prisma.user.deleteMany({ where: { email: "test-user@local" } });
    await prisma.$disconnect();
    mock.restore();
  });

  it("creates a contest submission and updates it after judge result", async () => {
    // Mock submitToJudge0 to return a token
    const fakeToken = "fake-token-123";
    mock.onPost(/submissions/).reply(200, { token: fakeToken });

    // Mock get to return a finished result
    const finishedResult = {
      status: { id: 3, description: "Accepted" },
      stdout: "OK",
    };
    mock
      .onGet(new RegExp(`/submissions/${fakeToken}`))
      .reply(200, finishedResult);

    // find test user and contest
    const user = await prisma.user.findUnique({
      where: { email: "test-user@local" },
    });
    const contest = await prisma.contest.findFirst({
      where: { title: "Test Contest" },
    });
    expect(user).toBeTruthy();
    expect(contest).toBeTruthy();

    // Submit
    const submission = await contestJudge.submitContestCode(
      contest!.id,
      0,
      user!.id,
      'print("hello")',
      71
    );
    expect(submission).toBeDefined();
    expect(submission.status).toBe("PENDING");

    // Call poller (it should pick up the pending submission and update it)
    await contestJudge.pollPendingSubmissions();

    const updated = await prisma.contestSubmission.findUnique({
      where: { id: submission.id },
    });
    expect(updated).toBeDefined();
    expect(updated!.status).toBeDefined();
    // result object should have been stored
    expect((updated as any).result).toBeTruthy();
  }, 20000);
});
