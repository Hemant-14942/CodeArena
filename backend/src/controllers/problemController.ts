import { Request, Response, NextFunction } from "express";
import Problem from "../models/problem";
import AppError from "../utils/AppError";

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
      return next(
        new AppError("Problem with same slug or order exists", 409)
      );
    }
    next(error);
  }
};
