import { Application, Request, Response } from 'express';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import router from './app/routes';
import { globalErrorHandler } from './app/middleware/globalErrorHandler';

const app: Application = express();

// Middleware setup
app.use(express.json());
app.use(cors({
  origin: 'https://bycycle-client.vercel.app', // Frontend URL
  credentials: true,              // Allow sending cookies
}));
app.use(cookieParser());

// Root route
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to assignment 3 server!');
});

// Routes
app.use('/api', router);

// Error handlers
app.use(globalErrorHandler);

export default app;
