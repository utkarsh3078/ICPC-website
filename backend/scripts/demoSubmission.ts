import dotenv from "dotenv";
import {
  submitContestCode,
  pollPendingSubmissions,
} from "../src/services/contestJudgeService";
import prisma from "../src/models/prismaClient";

dotenv.config();

async function main() {
  // Find any existing contest and user
  const user = await prisma.user.findFirst();
  const contest = await prisma.contest.findFirst();
  if (!user || !contest) {
    console.error(
      "No user or contest found. Create them or run the seed script."
    );
    process.exit(1);
  }

  console.log("Using user:", user.email, "contest:", contest.title);

  const src =
    '#include <bits/stdc++.h>\nusing namespace std;\nint main(){ cout<<"hello"; return 0; }';
  const submission = await submitContestCode(contest.id, 0, user.id, src, 53); // 53 => C++ (Judge0 mapping may differ)
  console.log(
    "Submission created:",
    submission.id,
    "token:",
    submission.token || submission.token_id || submission.raw?.token
  );

  console.log("Polling for results (this may take several seconds)...");
  // Poll a few times
  for (let i = 0; i < 12; i++) {
    await pollPendingSubmissions();
    const updated = await prisma.contestSubmission.findUnique({
      where: { id: submission.id },
    });
    if (updated && updated.status && updated.status !== "PENDING") {
      console.log("Result received:", updated.status);
      console.log(
        "Result object:",
        JSON.stringify(
          (updated as any).result || updated.result || updated.raw,
          null,
          2
        )
      );
      break;
    }
    await new Promise((r) => setTimeout(r, 2000));
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
