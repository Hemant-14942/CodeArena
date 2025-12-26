// src/schemas/userSchema.ts
import { z } from 'zod';

export const registerSchema = z.object({
    username: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
    avatar: z.string().url().optional(),
    bio: z.string().max(160).optional(),
    github: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    website: z.string().url().optional()
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
});