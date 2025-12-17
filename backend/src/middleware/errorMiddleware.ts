import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';

const globalErrorHandler = (
    err: any, 
    req: Request, 
    res: Response, 
    next: NextFunction
) => {
    // Default values if they are missing
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // 1. DEVELOPMENT MODE: Detailed logs for you (the developer)
    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack, // Shows exactly which file/line failed
        });
    } 
    // 2. PRODUCTION MODE: Clean logs for the user
    else {
        // Trusted error (User input error)
        if (err.isOperational) {
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        } 
        // Unknown bug (Programming error) -> Don't leak details!
        else {
            // Log to console so we (the devs) can check server logs later
            console.error('ERROR 💥', err); 

            res.status(500).json({
                status: 'error',
                message: 'Something went very wrong!',
            });
        }
    }
};

export default globalErrorHandler;