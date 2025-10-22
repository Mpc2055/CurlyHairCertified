import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

/**
 * Middleware to validate request body against a Zod schema
 * Throws ZodError if validation fails, which is caught by errorHandler
 *
 * @example
 * router.post('/topics',
 *   validateRequest(insertTopicSchema),
 *   asyncHandler(async (req, res) => {
 *     // req.body is now typed and validated
 *     const topic = await storage.createTopic(req.body);
 *     res.json(topic);
 *   })
 * );
 */
export function validateRequest(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      next(error); // ZodError will be caught by errorHandler
    }
  };
}

/**
 * Middleware to validate request params against a Zod schema
 */
export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware to validate request query against a Zod schema
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      next(error);
    }
  };
}
