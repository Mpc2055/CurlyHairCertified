import NodeCache from 'node-cache';
import crypto from 'crypto';
import { config } from '../../config';

// Cache for rate limiting and duplicate detection
const rateLimitCache = new NodeCache({ stdTTL: 3600 }); // 1 hour
const duplicateCache = new NodeCache({ stdTTL: config.rateLimit.duplicateWindowHours * 3600 }); // Configured hours

// Common spam keywords to auto-reject
const SPAM_KEYWORDS = [
  'viagra', 'cialis', 'casino', 'poker', 'lottery',
  'click here', 'buy now', 'limited time', 'act now',
  'free money', 'make money fast', 'work from home',
  'weight loss', 'miracle cure', 'enlargement',
];

interface SpamCheckResult {
  allowed: boolean;
  reason?: string;
}

export interface RateLimitInfo {
  posts: number;
  lastPost: number;
}

/**
 * Check if content passes spam protection checks
 */
export function checkSpamProtection(
  content: string,
  clientIp: string,
  title?: string
): SpamCheckResult {
  // 1. Content length validation
  const combinedContent = title ? `${title} ${content}` : content;
  if (combinedContent.length < 20) {
    return {
      allowed: false,
      reason: 'Content too short (minimum 20 characters)',
    };
  }

  if (combinedContent.length > 5000) {
    return {
      allowed: false,
      reason: 'Content too long (maximum 5000 characters)',
    };
  }

  // 2. Spam keyword detection
  const lowerContent = combinedContent.toLowerCase();
  for (const keyword of SPAM_KEYWORDS) {
    if (lowerContent.includes(keyword)) {
      return {
        allowed: false,
        reason: 'Content contains spam keywords',
      };
    }
  }

  // 3. Rate limiting: Use configured posts per hour
  const rateLimitKey = `rate:${clientIp}`;
  const rateLimitInfo = rateLimitCache.get<RateLimitInfo>(rateLimitKey);

  if (rateLimitInfo) {
    if (rateLimitInfo.posts >= config.rateLimit.postsPerHour) {
      return {
        allowed: false,
        reason: `Rate limit exceeded (${config.rateLimit.postsPerHour} posts per hour)`,
      };
    }
    // Update post count
    rateLimitCache.set<RateLimitInfo>(rateLimitKey, {
      posts: rateLimitInfo.posts + 1,
      lastPost: Date.now(),
    });
  } else {
    // First post from this IP
    rateLimitCache.set<RateLimitInfo>(rateLimitKey, {
      posts: 1,
      lastPost: Date.now(),
    });
  }

  // 4. Duplicate detection: reject same content in configured window
  const contentHash = crypto
    .createHash('sha256')
    .update(combinedContent.trim().toLowerCase())
    .digest('hex');

  const duplicateKey = `dup:${contentHash}`;
  if (duplicateCache.get(duplicateKey)) {
    return {
      allowed: false,
      reason: `Duplicate content detected (same content posted in last ${config.rateLimit.duplicateWindowHours} hours)`,
    };
  }

  // Mark content as posted
  duplicateCache.set(duplicateKey, true);

  return { allowed: true };
}

/**
 * Get rate limit info for an IP (for testing/debugging)
 */
export function getRateLimitInfo(clientIp: string): RateLimitInfo | null {
  const rateLimitKey = `rate:${clientIp}`;
  return rateLimitCache.get<RateLimitInfo>(rateLimitKey) || null;
}

/**
 * Clear rate limit for an IP (for testing/debugging)
 */
export function clearRateLimit(clientIp: string): void {
  const rateLimitKey = `rate:${clientIp}`;
  rateLimitCache.del(rateLimitKey);
}
