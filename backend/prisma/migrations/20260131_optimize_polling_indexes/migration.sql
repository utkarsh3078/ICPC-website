-- AddIndex for faster polling
-- Optimizes the query: SELECT * FROM contest_submission WHERE status = 'PENDING'
CREATE INDEX IF NOT EXISTS "idx_contest_submission_status_pending" ON "ContestSubmission"("status") WHERE "status" = 'PENDING';

-- AddIndex for faster user submission lookups
CREATE INDEX IF NOT EXISTS "idx_contest_submission_user_status" ON "ContestSubmission"("userId", "status");

-- AddIndex for contest submission lookups
CREATE INDEX IF NOT EXISTS "idx_contest_submission_contest_id" ON "ContestSubmission"("contestId");

-- AddIndex for faster task submission queries
CREATE INDEX IF NOT EXISTS "idx_submission_status" ON "Submission"("status");

-- AddIndex for faster user task submission lookups
CREATE INDEX IF NOT EXISTS "idx_submission_user_status" ON "Submission"("userId", "status");
