import { Request, Response, NextFunction } from "express";
import imagekit from "../config/imagekit";

export const imagekitAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authParams = imagekit.getAuthenticationParameters();
    res.status(200).json(authParams);
  } catch (err) {
    next(err);
  }
};
