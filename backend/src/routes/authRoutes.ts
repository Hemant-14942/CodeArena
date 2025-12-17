import express from 'express';
import { registerUser, loginUser } from '../controllers/authController';
import {validate} from '../middleware/validate';
import { registerSchema, loginSchema } from '../schemas/userSchema';

const router = express.Router();

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);

export default router;