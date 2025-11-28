import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// This file is a helper to prepare the test DB connection.
// It is not executed automatically. Use it in your integration tests to connect to DATABASE_URL_TEST.

export function loadTestEnv() {
  dotenv.config({ path: '.env.test' });
}

export function createPrismaForTest() {
  const prisma = new PrismaClient();
  return prisma;
}

// Instructions:
// 1. Copy `.env.test.example` to `.env.test` and update DATABASE_URL_TEST.
// 2. Run migrations against the test DB: `npx prisma migrate deploy --schema=./prisma/schema.prisma`
// 3. Run tests: `npm test`
