/**
 * Utility functions for formatting and validating URLs
 */

/**
 * Ensures a URL has a protocol prefix (http:// or https://)
 * If the URL already has a protocol, it's returned as-is
 * Otherwise, https:// is prepended
 *
 * @param url - The URL to normalize
 * @returns The URL with a protocol
 *
 * @example
 * ensureProtocol('wsalonrochester.com') // 'https://wsalonrochester.com'
 * ensureProtocol('http://example.com') // 'http://example.com'
 * ensureProtocol('https://example.com') // 'https://example.com'
 */
export function ensureProtocol(url: string): string {
  return url.startsWith('http://') || url.startsWith('https://')
    ? url
    : `https://${url}`;
}

/**
 * Formats an Instagram handle into a full Instagram URL
 *
 * @param handle - Instagram handle (with or without @)
 * @returns Full Instagram URL
 *
 * @example
 * getInstagramUrl('@username') // 'https://instagram.com/username'
 * getInstagramUrl('username') // 'https://instagram.com/username'
 */
export function getInstagramUrl(handle: string): string {
  const cleanHandle = handle.replace('@', '');
  return `https://instagram.com/${cleanHandle}`;
}
