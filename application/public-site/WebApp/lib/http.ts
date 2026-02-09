/**
 * API URL utilities for the public storefront.
 *
 * Client-side requests use relative paths so the browser hits the YARP gateway
 * on the same origin (e.g. tenant.fundraiseos.com/api/fundraiser/public/...).
 *
 * Server-side (SSR) requests use PUBLIC_API_BASE_URL which the AppHost sets to
 * the gateway's internal URL (https://localhost:9000 in dev).
 */

const SSR_BASE_URL = process.env.PUBLIC_API_BASE_URL ?? "https://localhost:9000";

/**
 * Builds the full URL for a public API path.
 * On the server, prepends the gateway base URL.
 * On the client, returns a relative path (routed through the gateway).
 */
export function apiUrl(path: string): string {
  if (typeof window === "undefined") {
    return `${SSR_BASE_URL}${path}`;
  }
  return path;
}
