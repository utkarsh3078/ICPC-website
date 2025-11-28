import { verifyLeetCode, verifyCodeforces } from "../utils/verifier";

describe("Verifier stubs", () => {
  it("detects leetcode links", async () => {
    expect(await verifyLeetCode("https://leetcode.com/problems/1")).toBe(true);
  });

  it("detects codeforces links", async () => {
    expect(
      await verifyCodeforces("https://codeforces.com/problemset/problem/1/1")
    ).toBe(true);
  });

  it("returns false for non-matching links", async () => {
    expect(await verifyLeetCode("https://example.com")).toBe(false);
    expect(await verifyCodeforces("https://example.com")).toBe(false);
  });
});
