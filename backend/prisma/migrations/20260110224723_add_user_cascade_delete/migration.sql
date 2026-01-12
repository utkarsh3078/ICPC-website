-- DropForeignKey
ALTER TABLE "Blog" DROP CONSTRAINT "Blog_authorId_fkey";

-- DropForeignKey
ALTER TABLE "ContestSubmission" DROP CONSTRAINT "ContestSubmission_contestId_fkey";

-- DropForeignKey
ALTER TABLE "ContestSubmission" DROP CONSTRAINT "ContestSubmission_userId_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_userId_fkey";

-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_userId_fkey";

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blog" ADD CONSTRAINT "Blog_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestSubmission" ADD CONSTRAINT "ContestSubmission_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestSubmission" ADD CONSTRAINT "ContestSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
