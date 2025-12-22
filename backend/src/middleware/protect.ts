import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import AppError from "../utils/AppError";

/*
  =========================
  PROTECT MIDDLEWARE
  =========================
  - Verifies ACCESS TOKEN
  - Used for protected routes
  - Does NOT use Redis
*/
export const protect = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    /*
      1️⃣ Get Authorization header
    */
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new AppError("Not authorized", 401));
    }

    /*
      2️⃣ Extract token
    */
    const token = authHeader.split(" ")[1];

    /*
      3️⃣ Verify access token
    */
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as { sub: string };

    /*
      4️⃣ Attach userId to request
      (used later in controllers)
    */
    (req as any).userId = decoded.sub;

    /*
      5️⃣ Continue to controller
    */
    next();
  } catch (error) {
    return next(new AppError("Invalid or expired token", 401));
  }
};
