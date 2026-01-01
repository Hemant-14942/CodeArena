import { create } from "domain";
import express from "express";
import { createProblem, getProblemBySlug } from "../controllers/problem.controller";
import { getAllProblems } from "../controllers/problem.controller";

const router = express.Router();

router.post("/createProblem",createProblem); 
router.get("/",getAllProblems);
router.get("/:slug",getProblemBySlug);
export default router;