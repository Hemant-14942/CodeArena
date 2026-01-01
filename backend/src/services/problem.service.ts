import redis from "../config/redisClient";
import Problem from "../models/problem";

interface GetProblemsOptions {
  page: number;
  limit: number;
  difficulty?: string;
  category?: string;
  search?: string;
}

export const getProblemsService = async ({
  page,
  limit,
  difficulty,
  category,
  search,
}: GetProblemsOptions) => {
    let cacheKey ="";
  let shouldCache = !search && page<=5; // Example condition for caching
  if(shouldCache){
    // Implement caching logic here (e.g., check Redis cache)
    const d = difficulty ?? "all";
    const c = category ?? "all";
    cacheKey = `problems:list:p:${page}:l:${limit}:d:${d}:c:${c}`;
    let cachedData = await redis.get(cacheKey);
    if(cachedData){
      return JSON.parse(cachedData);
    }

  }
  const skip = (page - 1) * limit;

  const filter: any = {};

  if (difficulty) {
    filter.difficulty = difficulty.toLowerCase();
  }

  if (category) {
    filter.category = category;
  }

  if (search) {
    filter.title = { $regex: search, $options: "i" };
  }

  const problems = await Problem.find(filter)
    .select(
      "title slug difficulty category likes dislikes order"
    )
    .sort({ order: 1 })
    .skip(skip)
    .limit(limit);

  const total = await Problem.countDocuments(filter);

 
  const result = {
    problems,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };

  if(shouldCache){
    redis.set(cacheKey, JSON.stringify(result), 'EX', 600); // Cache for 1 hour
  }

  return result;
};

export const getProblemBySlugService = async (slug: string) => {
  const cacheKey = `problems:slug:${slug}`;

  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const problem = await Problem.findOne({ slug })
    .select("-testcases");

  if (problem) {
    await redis.set(
      cacheKey,
      JSON.stringify(problem),
      "EX",
      300 // ⏱️ 5 minutes
    );
  }

  return problem;
};

