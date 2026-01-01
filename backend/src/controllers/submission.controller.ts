import { Request, Response, NextFunction } from "express";
import { createSubmissionService } from '../services/submission.service';

/*
  =========================
  CREATE SUBMISSION
  =========================
  - Protected route
  - Receives code from frontend
  - Delegates execution to service
*/
export const createSubmission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // protect middleware guarantees this
    const userId = req.user!._id;

    const { problemId, code, language } = req.body;

    if (!problemId || !code || !language) {
      return res.status(400).json({
        message: "problemId, code and language are required",
      });
    }

    const result = await createSubmissionService(
      userId,
      problemId,
      code,
      language
    );

    res.status(201).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
