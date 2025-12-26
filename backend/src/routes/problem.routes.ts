import { create } from "domain";
import express from "express";
import { createProblem } from "../controllers/problemController";

const router = express.Router();

router.post("/createProblem",createProblem); 
export default router;