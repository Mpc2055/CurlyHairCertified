/**
 * Centralized configuration management
 * All environment variables are accessed here with validation and type safety
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is required but not set`);
  }
  return value;
}

function optional(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

export const config = {
  /**
   * Server configuration
   */
  server: {
    port: parseInt(optional('PORT', '5000'), 10),
    env: optional('NODE_ENV', 'development'),
    isDevelopment: optional('NODE_ENV', 'development') === 'development',
    isProduction: optional('NODE_ENV', 'development') === 'production',
  },

  /**
   * Database configuration
   */
  database: {
    url: required('DATABASE_URL'),
  },

  /**
   * Google APIs configuration
   */
  google: {
    mapsApiKey: optional('GOOGLE_MAPS_API_KEY', ''),
    placesApiKey: optional('GOOGLE_PLACES_API_KEY', ''),
  },

  /**
   * Gemini AI configuration
   */
  gemini: {
    apiKey: optional('GEMINI_API_KEY', ''),
  },

  /**
   * Cache configuration
   */
  cache: {
    ttl: parseInt(optional('CACHE_TTL', '3600'), 10), // 1 hour default
  },

  /**
   * Rate limiting configuration
   */
  rateLimit: {
    postsPerHour: parseInt(optional('RATE_LIMIT_POSTS_PER_HOUR', '5'), 10),
    duplicateWindowHours: parseInt(optional('RATE_LIMIT_DUPLICATE_WINDOW', '24'), 10),
  },

  /**
   * Google sync intervals
   */
  sync: {
    googlePlacesSyncDays: parseInt(optional('GOOGLE_SYNC_INTERVAL_DAYS', '7'), 10),
    aiSummaryRefreshDays: parseInt(optional('AI_SUMMARY_REFRESH_DAYS', '30'), 10),
  },
} as const;

/**
 * Validate configuration on startup
 */
export function validateConfig(): void {
  // Required vars
  config.database.url; // Will throw if not set

  // Optional validation
  if (config.server.port < 1 || config.server.port > 65535) {
    throw new Error(`Invalid PORT: ${config.server.port}`);
  }

  console.log('[config] Configuration loaded successfully');
  console.log(`[config] Environment: ${config.server.env}`);
  console.log(`[config] Port: ${config.server.port}`);
}
