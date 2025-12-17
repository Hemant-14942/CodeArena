import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression'; 
import cookieParser from 'cookie-parser'; 
import rateLimit from 'express-rate-limit'; 
import connectDB from './config/db';
import AppError from './utils/AppError';
import globalErrorHandler from './middleware/errorMiddleware';
import authRouter from './routes/authRoutes';

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT  || 5000;


// --- 1. GLOBAL MIDDLEWARE ---

// Security Headers
app.use(helmet());

// Enable CORS (Cross-Origin Resource Sharing)
app.use(cors({
    origin: 'http://localhost:3000', // Only allow your Frontend to access
    credentials: true // Allow cookies to be sent
}));

// Rate Limiting: Limit each IP to 100 requests per 15 minutes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api', limiter); // Apply to all routes starting with /api

// Body Parser: Reading data from body into req.body
app.use(express.json({ limit: '10kb' })); // Limit body size to 10kb (Security)

// Cookie Parser: Reading cookies from the browser
app.use(cookieParser());

// Compression: Compress all responses (Text/JSON)
app.use(compression());

// Logger: Only in Development
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// --- 2. ROUTES ---
app.get('/', (req: Request, res: Response) => {
    res.status(200).send({ message: 'API is running...' });
});
app.use('/api/auth', authRouter);

// Test the Rate Limit (Refresh this page 101 times and see what happens!)
app.get('/api/test', (req, res) => {
    res.json({ status: "success" });
});
// 3. HANDLE UNKNOWN URLS (404)
// If the code reaches here, it means no route matched above
app.use((req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 4. GLOBAL ERROR HANDLER
app.use(globalErrorHandler);



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});