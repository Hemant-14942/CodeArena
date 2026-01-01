import {checkIfUserIsAdmin} from '../services/admin.service' // You need to implement this utility function
import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';

export const isAdmin = async(req: Request, res: Response, next: NextFunction) => {
  if (req.user ) {
    const userID = req.user?._id;
    if(!userID){
        return next( new AppError('User ID not found in request', 400));
    }

    // Assuming you have a function to check if the user is an admin
    const userIsAdmin = await checkIfUserIsAdmin(userID);
    // User is an admin
    if(!userIsAdmin){
        return  next( new AppError('Access denied. Admins only.', 403));
    }
    
    next(); 
    } else {
    return next( new AppError('User not authenticated', 401));
    }
  };    