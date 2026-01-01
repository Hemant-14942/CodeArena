import express from "express";
import { createSubmission } from "../controllers/submission.controller";
import { protect } from "../middleware/protect";

const router = express.Router();

/*
  =========================
  SUBMISSION ROUTES
  =========================
*/

// submit code
router.post("/submit", protect, createSubmission);

export default router;
