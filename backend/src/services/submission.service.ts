import Submission from "../models/submission";
import Problem from "../models/problem";
import AppError from "../utils/AppError";
import { runJudge0 } from "./judge0.service";
import { formatInput, formatOutput } from "../utils/testcaseFormatter";

export const createSubmissionService = async (
  userId: string,
  problemId: string,
  code: string,
  language: string
) => {
  const problem = await Problem.findById(problemId);

  if (!problem) {
    throw new AppError("Problem not found", 404);
  }

  // 1️⃣ Save submission first
  const submission = await Submission.create({
    userId,
    problemId,
    code,
    language,
    verdict: "Pending",
  });

  // 2️⃣ Run Judge0 testcases
  for (const test of problem.testcases) {
    const verdict = await runJudge0({
      code,
      language,
      stdin: formatInput(test.input),
      expectedOutput: formatOutput(test.output),
    });

    if (verdict !== "Accepted") {
      submission.verdict = verdict;
      await submission.save();
      return { submissionId: submission._id, verdict };
    }
  }

  // 3️⃣ All testcases passed
  submission.verdict = "Accepted";
  await submission.save();

  return { submissionId: submission._id, verdict: "Accepted" };
};
