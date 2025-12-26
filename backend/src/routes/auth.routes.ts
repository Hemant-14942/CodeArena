import express from 'express';
import { registerUser, loginUser, refreshAccessToken, logoutUser, logoutAllDevices } from '../controllers/authController';
import {validate} from '../middleware/validate';
import { registerSchema, loginSchema } from '../validators/user.zod';
import { log } from 'console';

const router = express.Router();

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);

router.get('/logout',logoutUser);
router.post("/logout-all", logoutAllDevices);
router.post("/refresh", refreshAccessToken);


export default router;