import request from "supertest";
import app from "../testApp";

describe("Health", () => {
  it("returns 200", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("OK");
  });
});
