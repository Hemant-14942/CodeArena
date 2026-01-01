import axios from "axios";

const JUDGE0_BASE_URL = process.env.JUDGE0_BASE_URL!;
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY!;

const languageMap: Record<string, number> = {
  javascript: 63,
  python: 71,
};

export type JudgeVerdict =
  | "Accepted"
  | "Wrong Answer"
  | "Runtime Error"
  | "Time Limit Exceeded";

export const runJudge0 = async ({
  code,
  language,
  stdin,
  expectedOutput,
}: {
  code: string;
  language: string;
  stdin: string;
  expectedOutput: string;
}): Promise<JudgeVerdict> => {
  const response = await axios.post(
    `${JUDGE0_BASE_URL}/submissions?base64_encoded=false&wait=true`,
    {
      source_code: code,
      language_id: languageMap[language],
      stdin,
      expected_output: expectedOutput,
    },
    {
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": JUDGE0_API_KEY,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
    }
  );

  const status = response.data.status?.description;

  switch (status) {
    case "Accepted":
      return "Accepted";
    case "Wrong Answer":
      return "Wrong Answer";
    case "Time Limit Exceeded":
      return "Time Limit Exceeded";
    default:
      return "Runtime Error";
  }
};
