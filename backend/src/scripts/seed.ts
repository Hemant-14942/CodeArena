import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Problem from '../models/Problem'; // Import the model we just made
import connectDB from '../config/db'; // Import connection logic

dotenv.config();

// THE DATA (3 Classic Problems)
const problems = [
  {
    title: "Two Sum",
    slug: "two-sum",
    difficulty: "Easy",
    category: "Array",
    order: 1,
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.
        
You may assume that each input would have **exactly one solution**, and you may not use the same element twice.`,
    starterCode: {
      javascript: "function twoSum(nums, target) {\n  // Write your code here\n};",
      python: "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        pass",
      cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};"
    },
    testCases: [
      { input: [2, 7, 11, 15], output: [0, 1] }, // 2 + 7 = 9
      { input: [3, 2, 4], output: [1, 2] },      // 2 + 4 = 6
      { input: [3, 3], output: [0, 1] }          // 3 + 3 = 6
    ],
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      }
    ],
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9"]
  },
  {
    title: "Reverse String",
    slug: "reverse-string",
    difficulty: "easy",
    category: "String",
    order: 2,
    description: "Write a function that reverses a string. The input string is given as an array of characters `s`.",
    starterCode: {
      javascript: "/**\n * @param {character[]} s\n * @return {void} Do not return anything, modify s in-place instead.\n */\nvar reverseString = function(s) {\n\n};",
      python: "class Solution:\n    def reverseString(self, s: List[str]) -> None:\n        \"\"\"\n        Do not return anything, modify s in-place instead.\n        \"\"\"\n        pass",
    },
    testCases: [
      { input: ["h","e","l","l","o"], output: ["o","l","l","e","h"] },
      { input: ["H","a","n","n","a","h"], output: ["h","a","n","n","a","H"] }
    ],
    examples: [
      { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' }
    ],
    constraints: ["1 <= s.length <= 10^5"]
  }
];

const ALLOWED_DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

const normalizeProblem = (p: any) => {
  // normalize difficulty
  const rawDiff = p.difficulty;
  const difficulty = typeof rawDiff === 'string' ? rawDiff.toLowerCase() : rawDiff;
  if (!ALLOWED_DIFFICULTIES.includes(difficulty)) {
    throw new Error(`Invalid difficulty "${p.difficulty}" for problem "${p.title}". Allowed: ${ALLOWED_DIFFICULTIES.join(', ')}`);
  }

  // normalize starterCode keys (handle javaScript vs javascript)
  const sc = p.starterCode || {};
  const starterCode = {
    javascript: sc.javascript ?? sc.javaScript ?? "",
    python: sc.python ?? "",
    cpp: sc.cpp ?? "",
    java: sc.java ?? ""
  };

  // normalize testcases key (some items use `testCases` camelCase)
  const testcases = p.testcases ?? p.testCases ?? [];

  return {
    title: p.title,
    slug: p.slug,
    description: p.description,
    difficulty,
    category: p.category,
    order: p.order,
    starterCode,
    testcases,
    examples: p.examples ?? [],
    constraints: p.constraints ?? [],
    likes: p.likes ?? 0,
    dislikes: p.dislikes ?? 0
  };
};

// THE LOGIC
const seedProblems = async () => {
  try {
    await connectDB();

    // 1. Clear old data
    await Problem.deleteMany({});
    console.log('🗑️  Old problems removed...');

    // 2. Normalize and Insert new data
    const normalized = problems.map(normalizeProblem);
    await Problem.insertMany(normalized);
    console.log('🌱 Problems Seeded Successfully!');

    // clean disconnect
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    try { await mongoose.disconnect(); } catch {}
    process.exit(1);
  }
};

seedProblems();
