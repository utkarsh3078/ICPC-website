import { chat } from "../services/aiService";

describe("AI service", () => {
  it("returns placeholder when no API key", async () => {
    const res = await chat("Hello");
    expect(res).toHaveProperty("reply");
    expect(typeof res.reply).toBe("string");
  });
});
