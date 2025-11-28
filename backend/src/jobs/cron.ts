import cron from "node-cron";
import prisma from "../models/prismaClient";
import { pollPendingSubmissions } from "../services/contestJudgeService";

export const startJobs = () => {
  // daily streak update at 00:05
  cron.schedule("5 0 * * *", async () => {
    console.log("Running daily streak update...");
    // Placeholder: update streaks based on submissions
    // Real logic would check last submission dates and update user stats
    try {
      // example: mark users with recent submissions
      // (left as stubs for extension)
    } catch (err) {
      console.error("Streak job error", err);
    }
  });

  // leaderboard refresh every hour
  cron.schedule("0 * * * *", async () => {
    console.log("Refreshing leaderboards...");
    try {
      // compute leaderboards and cache if needed
    } catch (err) {
      console.error("Leaderboard job error", err);
    }
  });

  // Poll Judge0 submissions every 30 seconds
  cron.schedule("*/30 * * * * *", async () => {
    console.log("Polling pending Judge0 submissions...");
    try {
      await pollPendingSubmissions();
    } catch (err) {
      console.error("Polling job error", err);
    }
  });
};
