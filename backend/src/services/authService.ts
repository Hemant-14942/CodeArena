import bcrypt from 'bcryptjs';
import User from '../models/User';

// Find a user by email
export const findUserByEmail = async (email: string) => {
    return await User.findOne({ email });
};

// Compare raw password with hashed password
export const verifyPassword = async (candidatePassword: string, userPassword: string): Promise<boolean> => {
    return await bcrypt.compare(candidatePassword, userPassword);
};