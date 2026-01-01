import express from 'express';
import { registerUser, loginUser, refreshAccessToken, logoutUser, logoutAllDevices } from '../controllers/auth.controller';
import {validate} from '../middleware/validate';                                       
import { registerSchema, loginSchema } from '../validators/user.zod';
import {protect} from '../middleware/protect';

const router = express.Router();

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);

router.get('/logout',protect,logoutUser);
router.post("/logout-all",protect, logoutAllDevices);
router.post("/refresh", refreshAccessToken);


export default router;          