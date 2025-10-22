import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wrapper for async route handlers that catches errors and passes them to error middleware
 * Eliminates the need for try-catch blocks in every route
 *
 * @example
 * app.get('/api/users', asyncHandler(async (req, res) => {
 *   const users = await storage.getUsers();
 *   res.json(users);
 * }));
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
