import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { ApiError } from '../utils/apiError';

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === 'ValidationError') {
    // Handle Mongoose validation errors
    statusCode = 400;
    message = err.message;
  }

  // Log the error for the developer
  logger.error(`${statusCode} - ${err.message} - ${req.originalUrl} - ${req.method}`);
  
  // Hide stack trace in production
  const response = {
    status: 'error',
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};