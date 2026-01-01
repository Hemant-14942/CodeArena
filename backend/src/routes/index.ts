import express from "express";
import authroutes from "./auth.routes";
import imagekitRoutes from "./imagekit.routes";
import problemRoutes from "./problem.routes";
import submissionRoutes from "./submission.routes";
const router = express.Router();

router.use("/api/auth", authroutes);
router.use("/api/imagekit", imagekitRoutes);
router.use("/api/problems", problemRoutes);
router.use("/api/submissions", submissionRoutes);




export default router;