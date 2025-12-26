import express from "express";
import authroutes from "./auth.routes";
import imagekitRoutes from "./imagekit.routes";
const router = express.Router();

router.use("/api/auth", authroutes);
router.use("/api/imagekit", imagekitRoutes);


export default router;