import cron from "node-cron";
import { pollPendingSubmissions } from "../services/contestJudgeService";
import { logger } from "../utils/logger";

let jobsStarted = false;

export const startJobs = () => {
  if (jobsStarted) {
    logger.debug("Jobs already started; skipping re-registration");
    return;
  }
  jobsStarted = true;

  // daily streak update at 00:05
  cron
    .schedule("5 0 * * *", async () => {
      logger.info("Running daily streak update...");
      try {
        // Placeholder: update streaks based on submissions
      } catch (err) {
        logger.error({ err }, "Streak job error");
      }
    })
    .start();

  // leaderboard refresh every hour
  cron.schedule("0 * * * *", async () => {
    logger.info("Refreshing leaderboards...");
    try {
      // compute leaderboards and cache if needed
    } catch (err) {
      logger.error({ err }, "Leaderboard job error");
    }
  });

  // Poll Judge0 submissions - more intelligent polling strategy
  let isPolling = false;
  let lastPollTime = 0;
  let pollIntervalMs = 30000; // Start with 30s
  const maxPollIntervalMs = 120000; // Max 2 minutes

  cron
    .schedule("*/10 * * * * *", async () => {
      // Run every 10 seconds to check if polling is needed
      if (isPolling) return;

      const now = Date.now();
      // Only run if enough time has passed
      if (now - lastPollTime < pollIntervalMs) return;

      isPolling = true;
      lastPollTime = now;

      try {
        const pollResult = await pollPendingSubmissions();

        // If submissions were found and updated, keep polling frequently
        if (pollResult.processedCount > 0) {
          pollIntervalMs = 30000; // 30 seconds
          logger.debug(
            `Polling job: processed ${pollResult.processedCount} submissions`,
          );
        } else {
          // No submissions to process, increase interval gradually
          pollIntervalMs = Math.min(pollIntervalMs + 10000, maxPollIntervalMs);
          logger.debug(
            `Polling job: no pending submissions, backing off to ${pollIntervalMs}ms`,
          );
        }
      } catch (err) {
        logger.error({ err }, "Polling job error");
        // On error, reset to normal interval
        pollIntervalMs = 30000;
      } finally {
        isPolling = false;
      }
    })
    .start();
};
