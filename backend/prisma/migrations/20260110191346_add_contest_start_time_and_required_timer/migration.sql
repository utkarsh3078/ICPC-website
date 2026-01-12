/*
  Warnings:

  - Added the required column `startTime` to the `Contest` table without a default value. This is not possible if the table is not empty.
  - Made the column `timer` on table `Contest` required. This step will fail if there are existing NULL values in that column.

*/
-- First, set default values for existing records
-- Set timer to 60 minutes for any NULL values
UPDATE "Contest" SET "timer" = 60 WHERE "timer" IS NULL;

-- Add startTime column with a temporary default, then remove default
ALTER TABLE "Contest" ADD COLUMN "startTime" TIMESTAMP(3);

-- Set startTime to createdAt for existing records
UPDATE "Contest" SET "startTime" = "createdAt" WHERE "startTime" IS NULL;

-- Now make the columns required
ALTER TABLE "Contest" ALTER COLUMN "startTime" SET NOT NULL;
ALTER TABLE "Contest" ALTER COLUMN "timer" SET NOT NULL;
