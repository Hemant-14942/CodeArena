import { Response,Request,NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import AppError from "../utils/AppError";
import generateToken from "../utils/generateToken";
import { verifyPassword, findUserByEmail } from "../services/authService";

export const registerUser = async(req:Request, res:Response, next:NextFunction) => {
    try{


    const { username, email, password } = req.body;
    if(!username || !email || !password) {
        return next(new AppError("Please fill the required fields", 400));
    }

    const userExists = await findUserByEmail(email);
    if(userExists) {
        return next(new AppError("User already exists", 400));
    }

    const user = await User.create({ username, email, password });

    // 3. Send Token & Response
        if (user) {
            generateToken(res, user._id.toString());
            res.status(201).json({
                status: 'success',
                data: {
                    _id: user._id.toString,
                    username: user.username,
                    email: user.email,
                    isAdmin: user.isAdmin,
                },
            });
        }
    }
        catch (error) {
            next(error);
        }
}
export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        // 1. Find User (Explicitly select password because it might be hidden)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return next(new AppError('credentials do not match', 401));
        }

        // 2. Verify Password (using our Service)
        const isMatch = await verifyPassword(password, user.password);

        if (!isMatch) {
            return next(new AppError('credentials do not match', 401));
        }

        // 3. Send Token & Response
        generateToken(res, user._id.toString());

        res.status(200).json({
            status: 'success',
            data: {
                _id: user._id.toString(),
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin,
                // We can even send back the avatar now!
                avatar: user.avatar 
            },
        });
    } catch (error) {
        next(error);
    }
};
