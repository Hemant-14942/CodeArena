import express from "express";
import { imagekitAuth } from "../controllers/imagekitController";

const router = express.Router();

router.get("/auth", imagekitAuth);

export default router;
