import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { config } from '../../config';

/**
 * Base storage class providing shared database connection
 * All domain-specific storage classes extend this
 */
export class BaseStorage {
  protected readonly db: ReturnType<typeof drizzle>;

  constructor() {
    const sql = neon(config.database.url);
    this.db = drizzle(sql);
  }

  /**
   * Helper to normalize Instagram handles
   * Handles multiple Instagram accounts separated by |
   */
  protected normalizeInstagram(handle: string | null | undefined): string | undefined {
    if (!handle) return undefined;
    const trimmed = handle.trim();
    if (!trimmed) return undefined;

    // Handle multiple Instagram handles separated by |
    const handles = trimmed.split('|').map(h => h.trim());
    const primaryHandle = handles[0];

    // Add @ prefix if missing
    return primaryHandle.startsWith('@') ? primaryHandle : `@${primaryHandle}`;
  }
}
