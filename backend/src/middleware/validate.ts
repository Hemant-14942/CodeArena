import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod'; // <--- Import ZodSchema instead of AnyZodObject

// Change the type here to 'ZodSchema<any>'
// This is the universal type that accepts ANY Zod definition
export const validate = (schema: ZodSchema<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    try {
        // Parse checks the body against the rules
        schema.parse(req.body);
        next();
    } catch (error) {
        if (error instanceof ZodError) {
            const errorMessages = error.issues.map((err) => ({
                field: err.path[0],
                message: err.message
            }));
            
             // We use 'return' to stop the function here
             res.status(400).json({ errors: errorMessages });
             return;
        }
        next(error);
    }
};

export default validate;