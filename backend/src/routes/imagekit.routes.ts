import express from "express";
import { imagekitAuth } from "../controllers/imagekit.controller";

const router = express.Router();

router.get("/auth", imagekitAuth);

export default router;
