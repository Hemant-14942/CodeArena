import dotenv from 'dotenv';
dotenv.config(); // MUST be first

import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import connectDB from './config/db';
import { connectRedis } from './config/redisClient';
import AppError from './utils/AppError';
import globalErrorHandler from './middleware/errorMiddleware';
import allroutes from './routes';

const app = express();
const PORT = process.env.PORT || 5000;

// --- GLOBAL MIDDLEWARE ---
app.use(helmet());

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(compression());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// --- ROUTES ---
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'API is running...' });
});

app.use('/', allroutes);

// --- 404 HANDLER ---
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// --- GLOBAL ERROR HANDLER ---
app.use(globalErrorHandler);

// --- SERVER BOOTSTRAP ---
const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server', err);
    process.exit(1);
  }
};

startServer();
