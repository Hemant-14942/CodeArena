import Problem from "../models/problem";
import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";
const createProblem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, description, difficulty, tags } = req.body;  
        if (!title || !description || !difficulty) {
            return next(new AppError("Title, description, and difficulty are required", 400));
        }   
        const newProblem = await Problem.create({
            title,
            description,    
            difficulty,
            tags
        });
        res.status(201).json({
            status: "success",
            data: { 
                problem: newProblem
            }
        });
    } catch (error) {
        next(error);
    }
};
export default { createProblem };