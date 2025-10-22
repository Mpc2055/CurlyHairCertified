import { Request, Response, NextFunction } from 'express';
import { checkSpamProtection } from '../spam-protection';
import { rateLimitError } from './errorHandler';

/**
 * Middleware to apply spam protection checks
 * Checks content length, spam keywords, rate limiting, and duplicate detection
 *
 * @param options - Configuration for spam protection
 * @example
 * router.post('/topics',
 *   spamProtection({ includeTitle: true }),
 *   asyncHandler(async (req, res) => {
 *     const topic = await storage.createTopic(req.body);
 *     res.json(topic);
 *   })
 * );
 */
export function spamProtection(options: { includeTitle?: boolean } = {}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const content = req.body.content || '';
    const title = options.includeTitle ? req.body.title : undefined;

    const spamCheck = checkSpamProtection(content, clientIp, title);

    if (!spamCheck.allowed) {
      return next(rateLimitError(spamCheck.reason));
    }

    next();
  };
}
