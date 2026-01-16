import prisma from "../models/prismaClient";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing in environment");
}

export interface GoogleProfile {
  id: string;
  displayName: string;
  emails: Array<{ value: string }>;
  photos: Array<{ value: string }>;
  _json: {
    email: string;
    name: string;
    picture: string;
  };
}

export const findOrCreateGoogleUser = async (profile: GoogleProfile) => {
  const email = profile.emails[0]?.value || profile._json.email;
  const googleId = profile.id;

  // Try to find existing user by googleId
  let user = await prisma.user.findUnique({
    where: { googleId },
  });

  // If not found by googleId, try to find by email
  if (!user) {
    user = await prisma.user.findUnique({
      where: { email },
    });

    // If user exists but doesn't have googleId, link the Google account
    if (user) {
      user = await prisma.user.update({
        where: { email },
        data: {
          googleId,
          googleEmail: email,
        },
      });
    }
  }

  // If user doesn't exist, create a new one with Google OAuth
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        googleId,
        googleEmail: email,
        password: null, // No password for OAuth users
        role: "STUDENT",
        approved: true, // Auto-approve Google OAuth users (can be changed)
        profile: {
          create: {
            name:
              profile.displayName || profile._json.name || email.split("@")[0],
            branch: "",
            year: 1,
            contact: "",
          },
        },
      },
      include: {
        profile: true,
      },
    });
  }

  return user;
};

export const generateToken = (userId: string, role: string) => {
  const token = jwt.sign({ id: userId, role }, JWT_SECRET, {
    expiresIn: "7d",
  });
  return token;
};

export const getGoogleUserById = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      submissions: true,
      contestSubmissions: true,
    },
  });
};
