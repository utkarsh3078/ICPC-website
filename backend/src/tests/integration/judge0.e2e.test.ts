import request from "supertest";
import app from "../../testApp";

// This test runs only when a real Judge0 endpoint is configured and SKIP_JUDGE0 is not set.
const judge0Url = process.env.JUDGE0_URL;
const judge0Key = process.env.JUDGE0_KEY;
const skipJudge0 = process.env.SKIP_JUDGE0 === "true";

describe("Judge0 E2E (integration - optional)", () => {
  if (!judge0Url || skipJudge0 || !judge0Key) {
    test("skipped - JUDGE0_URL not set or SKIP_JUDGE0=true", () => {
      expect(true).toBe(true);
    });
    return;
  }

  test("submit and poll via /api/judge endpoints", async () => {
    // This requires a seeded user and a valid JWT in env for tests; we simplify by
    // skipping authentication in CI for E2E or expect the demo user to be present.
    // For safety, we'll just call the direct judge proxy without auth if CI allows.

    const res = await request(app)
      .post("/api/judge/submit")
      .send({ source: 'print("hello")', language_id: 71 })
      .set("Accept", "application/json");

    expect([200, 201]).toContain(res.status);
    const token = res.body?.token;
    expect(token).toBeDefined();

    // Poll for result
    const poll = await request(app).get(`/api/judge/result/${token}`);
    expect([200, 202]).toContain(poll.status);
  }, 30000);
});
