import express from "express";
import authroutes from "./authRoutes";
import imagekitRoutes from "./imagekitRoutes";
const router = express.Router();

router.use("/api/auth", authroutes);
router.use("/api/imagekit", imagekitRoutes);


export default router;