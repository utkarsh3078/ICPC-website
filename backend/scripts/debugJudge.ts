import request from "supertest";
import app from "../src/testApp";

async function run() {
  console.log("JUDGE0_URL:", process.env.JUDGE0_URL);
  console.log(
    "JUDGE0_KEY:",
    process.env.JUDGE0_KEY ? "(present)" : "(missing)"
  );

  try {
    const res = await request(app)
      .post("/api/judge/submit")
      .send({ source: 'print("hello")', language_id: 71 })
      .set("Accept", "application/json");

    console.log("submit status:", res.status);
    console.log("submit body:", JSON.stringify(res.body, null, 2));

    const token = res.body?.token;
    if (token) {
      const poll = await request(app).get(`/api/judge/result/${token}`);
      console.log("poll status:", poll.status);
      console.log("poll body:", JSON.stringify(poll.body, null, 2));
    }
  } catch (err: any) {
    console.error("error running debug request:", err);
  }
}

run();
