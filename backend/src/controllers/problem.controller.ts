import { Request, Response, NextFunction } from "express";
import Problem from "../models/problem";
import AppError from "../utils/AppError";
import {
  getProblemsService,
  getProblemBySlugService,
} from "../services/problem.service";
import redis from "../config/redisClient";

export const createProblem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    /*
       Extract validated data
    */
    const {
      title,
      slug,
      description,
      difficulty,
      category,
      order,
      starterCode,
      testcases,
      examples,
      constraints,
    } = req.body;

    /*
      Normalize fields
    */
    const normalizedSlug = slug.toLowerCase().trim();
    const normalizedDifficulty = difficulty.toLowerCase();

    /*
      Check duplicate slug
    */
    const existingProblem = await Problem.findOne({
      slug: normalizedSlug,
    });

    if (existingProblem) {
      return next(new AppError("Problem slug already exists", 409));
    }

    /*
       Create problem
    */
    const problem = await Problem.create({
      title: title.trim(),
      slug: normalizedSlug,
      description,
      difficulty: normalizedDifficulty,
      category,
      order,
      starterCode,
      testcases,
      examples,
      constraints,
    });

    // Invalidate related caches industry preference way
    let cursor = "0";
    do {
      const [nextCursor, keys] = await redis.scan(
        cursor,
        "MATCH",
        "problems:*",
        "COUNT",
        100
      );

      cursor = nextCursor;

      if (keys.length > 0) {
        await redis.del(keys);
      }
    } while (cursor !== "0");

    /*
       Respond
    */
    res.status(201).json({
      status: "success",
      data: {
        id: problem._id,
        slug: problem.slug,
        title: problem.title,
        difficulty: problem.difficulty,
      },
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return next(new AppError("Problem with same slug or order exists", 409));
    }
    next(error);
  }
};
export const getAllProblems = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { difficulty, category, search } = req.query;
    const result = await getProblemsService({
      page,
      limit,
      difficulty: difficulty as string,
      category: category as string,
      search: search as string,
    });

    res.status(200).json({
      status: "success",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};
/*
  =========================
  GET SINGLE PROBLEM
  =========================
*/
export const getProblemBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    const problem = await getProblemBySlugService(slug);

    if (!problem) {
      return next(new AppError("Problem not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: problem,
    });
  } catch (error) {
    next(error);
  }
};
