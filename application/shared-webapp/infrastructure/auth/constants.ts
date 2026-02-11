/**
 * Path of the page used when signing up for a new account
 */
export const signUpPath = "/signup";
/**
 * Path of the page used to log in as user
 */
export const loginPath = "/login";

/**
 * Build a tenant-scoped path: /{slug}/{app}/{subpath}
 * Falls back to /{app}/{subpath} when slug is undefined (legacy).
 */
export function tenantPath(slug: string | undefined, app: string, subpath?: string): string {
  const normalizedApp = app.replace(/^\//, "");
  const normalizedSub = subpath ? `/${subpath.replace(/^\//, "")}` : "";
  return slug ? `/${slug}/${normalizedApp}${normalizedSub}` : `/${normalizedApp}${normalizedSub}`;
}

/**
 * Convenience wrapper for admin paths: /{slug}/admin/{subpath}
 */
export function adminPath(slug?: string, subpath?: string): string {
  return tenantPath(slug, "admin", subpath);
}

/**
 * Path to the default page shown after successful login.
 * Reads the current tenant slug from the runtime-injected user info.
 */
export function loggedInPath(): string {
  return adminPath(import.meta.user_info_env?.tenantSlug);
}

/**
 * Path of the page shown after successful signing up.
 */
export function signedUpPath(): string {
  return adminPath(import.meta.user_info_env?.tenantSlug);
}
