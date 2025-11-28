import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../models/prismaClient";
import { User } from "@prisma/client";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing in environment");
}

const JWT_SECRET = process.env.JWT_SECRET;

export interface AuthRequest extends Request {
  user?: User;
}

export const isAuthenticated = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const auth = req.headers.authorization;
  if (!auth) {
    return res.status(401).json({ message: "No token provided" });
  }

  if (!auth.toLowerCase().startsWith("bearer ")) {
    return res.status(401).json({ message: "Invalid authorization format" });
  }

  const token = auth.split(" ")[1];

  try {
    const payload: any = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.id } });

    if (!user || !user.approved) {
      return res
        .status(403)
        .json({ message: "User not approved or not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const isAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  if (req.user.role !== "ADMIN")
    return res.status(403).json({ message: "Admin only" });
  next();
};

export const isAlumni = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  if (req.user.role !== "ALUMNI")
    return res.status(403).json({ message: "Alumni only" });
  next();
};
