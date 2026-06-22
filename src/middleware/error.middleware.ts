import type { ErrorRequestHandler } from 'express';
import { ApiError } from '../utils/api-error.js';
import { logger } from '../config/logger.js';

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      details: error.details
    });
  }

  if (error?.name === 'ValidationError' || error?.name === 'CastError' || error?.code === 11000) {
    return res.status(422).json({
      success: false,
      message: error.code === 11000 ? 'Duplicate record' : 'Validation failed',
      details: error.errors ?? error.keyValue ?? error.message
    });
  }

  console.error('Raw unhandled error:', error);
  logger.error(
    {
      err: error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined
    },
    'Unhandled API error'
  );
  return res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
};
