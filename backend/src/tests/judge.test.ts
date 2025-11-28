import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { submitToJudge0, getJudge0Result } from "../services/judgeService";

describe("Judge0 service", () => {
  const mock = new MockAdapter(axios);

  afterEach(() => mock.reset());

  it("submits code and returns token", async () => {
    mock.onPost(/submissions/).reply(201, { token: "abc123" });
    const res = await submitToJudge0("print(1)", 71);
    expect(res).toHaveProperty("token");
    expect(res.token).toBe("abc123");
  });

  it("fetches result for token", async () => {
    mock
      .onGet(/submissions\/abc123/)
      .reply(200, { status: { description: "Accepted" }, stdout: "1" });
    const r = await getJudge0Result("abc123");
    expect(r).toHaveProperty("status");
    expect(r.status.description).toBe("Accepted");
  });
});
