jest.mock("../../models/prismaClient", () => ({
  __esModule: true,
  default: {
    user: {
      create: jest.fn(async (data: any) => ({ id: "u-1", ...data.data })),
      findUnique: jest.fn(async (args: any) => {
        if (args.where.email === "exists@local")
          return {
            id: "u-2",
            email: "exists@local",
            password: "$2b$10$abc",
            approved: true,
          };
        return null;
      }),
      update: jest.fn(async (args: any) => ({
        id: args.where.id,
        ...args.data,
      })),
    },
  },
}));

import * as authService from "../../services/authService";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("AuthService (unit - mocked prisma)", () => {
  beforeAll(() => {
    (bcrypt.hash as any).mockResolvedValue("hashedpw");
    (bcrypt.compare as any).mockResolvedValue(true);
    (jwt.sign as any).mockReturnValue("jwt-token");
  });

  test("registerUser calls prisma.create and returns user", async () => {
    const u = await authService.registerUser("new@local", "password");
    expect(u).toBeDefined();
    expect((u as any).email).toBe("new@local");
  });

  test("login throws on missing user", async () => {
    await expect(authService.login("nope@local", "x")).rejects.toThrow();
  });

  test("login returns token for existing user", async () => {
    // findUnique mocked to return user for 'exists@local'
    const res = await authService.login("exists@local", "password");
    expect(res).toBeDefined();
    expect((res as any).token).toBe("jwt-token");
  });
});
