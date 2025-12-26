import { z } from "zod";
export const createProblemSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().min(10),

  difficulty: z.enum(["easy", "medium", "hard"]),
  category: z.string(),
  order: z.number().int().positive(),

  starterCode: z.object({
    javaScript: z.string().optional(),
    python: z.string().optional(),
    cpp: z.string().optional(),
    java: z.string().optional(),
  }).optional(), // ⭐ whole object optional

  testcases: z.array(
    z.object({
      input: z.any(),
      output: z.any(),
    })
  ).min(1),

  examples: z.array(
    z.object({
      input: z.string(),
      output: z.string(),
      explanation: z.string().optional(),
    })
  ).min(1),

  constraints: z.array(z.string()).optional(),
});
