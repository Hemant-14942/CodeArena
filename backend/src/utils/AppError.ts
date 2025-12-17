class AppError extends Error {
    public statusCode: number;
    public status: string;
    public isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message); // Calls the parent 'Error' class

        this.statusCode = statusCode;
        // If the code starts with '4' (404, 400), it's a 'fail'. If '5', it's an 'error'.
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        
        // isOperational = true means "We know this might happen" (like wrong password).
        // It helps distinguish system crashes from user errors.
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;



