import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

/**
 * Custom error class for API errors with status codes
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Centralized error handling middleware
 * Handles different error types and formats consistent error responses
 */
export function errorHandler(
  err: Error | ApiError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error for debugging
  console.error(`[${req.method} ${req.path}] Error:`, {
    name: err.name,
    message: err.message,
    ...(err instanceof ApiError && err.details ? { details: err.details } : {}),
  });

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation error',
      errors: err.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Handle custom API errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  // Handle specific error messages
  if (err.message.includes('not found')) {
    return res.status(404).json({
      message: err.message,
    });
  }

  if (err.message.includes('validation')) {
    return res.status(400).json({
      message: err.message,
    });
  }

  if (err.message.includes('nesting depth')) {
    return res.status(400).json({
      message: err.message,
    });
  }

  // Default to 500 Internal Server Error
  const status = (err as any).status || (err as any).statusCode || 500;
  res.status(status).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}

/**
 * Helper to create not found errors
 */
export function notFound(resource: string): ApiError {
  return new ApiError(404, `${resource} not found`);
}

/**
 * Helper to create validation errors
 */
export function validationError(message: string, details?: any): ApiError {
  return new ApiError(400, message, details);
}

/**
 * Helper to create rate limit errors
 */
export function rateLimitError(message: string = 'Rate limit exceeded'): ApiError {
  return new ApiError(429, message);
}
