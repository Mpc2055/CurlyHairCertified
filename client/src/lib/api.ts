/**
 * @deprecated This file is deprecated. Use the new API client instead.
 *
 * Migration guide:
 * - Old: `apiRequest('GET', '/api/directory')`
 * - New: `api.directory.getDirectory()`
 *
 * See: /src/lib/api-client.ts
 */

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * @deprecated Use the typed API client from @/lib/api-client instead
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}
