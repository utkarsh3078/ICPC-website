/*
  Warnings:

  - You are about to drop the column `verified` on the `Submission` table. All the data in the column will be lost.
  - The `assignedTo` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_taskId_fkey";

-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "verified",
ADD COLUMN     "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "assignedTo",
ADD COLUMN     "assignedTo" JSONB;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
