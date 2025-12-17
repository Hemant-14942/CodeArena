import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { Response } from 'express';

const generateToken = (res: Response, userId: string) => {
    // 1. Fetch values from .env
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRE; // Match the name in your .env file!

    // 2. SAFETY CHECK: Ensure they exist before using them
    if (!secret || !expiresIn) {
        throw new Error("JWT_SECRET or JWT_EXPIRE is not defined in the .env file");
    }

    // 3. Generate the Token
    // We cast options explicitly to avoid the "Overload" error
    const token = jwt.sign({ userId }, secret as Secret, {
        expiresIn: expiresIn // Now TS knows this is a valid string
    } as SignOptions);

    // 4. Send the Cookie
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development', // Use HTTPS in production
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 Days in milliseconds
    });
};

export default generateToken;