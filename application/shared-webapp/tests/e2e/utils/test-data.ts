import * as fs from "node:fs";
import * as path from "node:path";
import { faker } from "@faker-js/faker";
import type { Page } from "@playwright/test";
import { isLocalhost } from "./constants";
import type { TestContext } from "./test-assertions";
import { expectToastMessage, typeOneTimeCode } from "./test-assertions";

/**
 * Build a slug-based admin URL for E2E tests.
 * @param slug Tenant slug
 * @param path Optional sub-path (e.g. "/users")
 * @param queryParams Optional query parameters
 * @param hash Optional hash fragment (e.g. "#x")
 */
export function adminUrl(slug: string, path?: string, queryParams?: Record<string, string>, hash?: string): string {
  let url = `/${slug}/admin`;
  if (path) {
    url += path.startsWith("/") ? path : `/${path}`;
  }
  if (queryParams && Object.keys(queryParams).length > 0) {
    const params = new URLSearchParams(queryParams);
    url += `?${params.toString()}`;
  }
  if (hash) {
    url += hash.startsWith("#") ? hash : `#${hash}`;
  }
  return url;
}

/**
 * Read platform settings from the shared-kernel JSONC file.
 * This ensures tests use the same configuration as the application.
 */
function readPlatformSettings(): { identity: { internalEmailDomain: string } } {
  const settingsPath = path.resolve(
    __dirname,
    "../../../../shared-kernel/SharedKernel/Platform/platform-settings.jsonc"
  );
  const content = fs.readFileSync(settingsPath, "utf-8");
  const jsonWithoutComments = content.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
  return JSON.parse(jsonWithoutComments);
}

const platformSettings = readPlatformSettings();

/**
 * Get the internal email domain from platform settings.
 * Internal users have access to back-office features.
 * @returns Internal email domain suffix (e.g., "@platformplatform.net")
 */
export function getInternalEmailDomain(): string {
  return platformSettings.identity.internalEmailDomain;
}

/**
 * Generate a unique email with timestamp to ensure uniqueness
 * @returns Unique email address
 */
export function uniqueEmail(): string {
  // Compact timestamp (YY-MM-DDTHH-MM)
  const timestamp = new Date().toISOString().slice(2, 16).replace(/[-:T]/g, "");

  const username = faker.internet.username().toLowerCase();
  return `${username}@${timestamp}.local`;
}

/**
 * Generate a unique internal user email with the platform's internal domain.
 * Internal users have access to back-office features.
 * @returns Unique internal email address (e.g., "john.doe@platformplatform.net")
 */
export function internalUserEmail(): string {
  const first = firstName().toLowerCase();
  const last = lastName().toLowerCase();
  const timestamp = new Date().toISOString().slice(2, 16).replace(/[-:T]/g, "");
  const domain = getInternalEmailDomain().replace("@", "");
  return `${first}.${last}.${timestamp}@${domain}`;
}

/**
 * Generate a random first name
 * @returns Random first name
 */
export function firstName(): string {
  return faker.person.firstName();
}

/**
 * Generate a random last name
 * @returns Random last name
 */
export function lastName(): string {
  return faker.person.lastName();
}

/**
 * Generate a random job title
 * @returns Random job title
 */
export function jobTitle(): string {
  return faker.person.jobTitle();
}

/**
 * Generate a random company name
 * @returns Random company name
 */
export function companyName(): string {
  return faker.company.name();
}

/**
 * Get the correct verification code for the current environment
 * @returns "UNLOCK" for local development, or instructions for CI
 */
export function getVerificationCode(): string {
  // For local development, always use "UNLOCK"
  if (isLocalhost()) {
    return "UNLOCK";
  }

  // For CI/CD environments, we'll need to implement email checking
  // For now, throw an error to remind us to implement this
  throw new Error("CI/CD verification code retrieval not yet implemented. Need to check email service.");
}

/**
 * Generate test user data
 * @returns Complete user data object
 */
export function testUser() {
  const first = firstName();
  const last = lastName();
  // Compact timestamp (YY-MM-DDTHH-MM)
  const timestamp = new Date().toISOString().slice(2, 16).replace(/[-:T]/g, "");
  const email = `${first.toLowerCase()}.${last.toLowerCase()}@${timestamp}.local`;

  return {
    email,
    firstName: first,
    lastName: last,
    fullName: `${first} ${last}`,
    jobTitle: jobTitle(),
    company: companyName()
  };
}

/**
 * Complete the full signup flow for a user
 * @param page Playwright page instance
 * @param expect Playwright expect function
 * @param user User data object with email, firstName, lastName
 * @param keepUserLoggedIn Whether to keep the user logged in after signup (default: true)
 * @param context Test context for asserting toasts
 * @returns Promise that resolves when signup is complete
 */
export async function completeSignupFlow(
  page: Page,
  expect: typeof import("@playwright/test").expect,
  user: { email: string; firstName: string; lastName: string },
  context: TestContext,
  keepUserLoggedIn = true,
  slug?: string
): Promise<{ slug: string }> {
  // Step 1: Navigate directly to signup page
  await page.goto("/signup");

  // Wait for the page to be fully loaded
  await page.waitForLoadState("domcontentloaded");

  await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();

  // Step 2: Enter email and submit
  await page.getByRole("textbox", { name: "Email" }).fill(user.email);
  await page.getByRole("button", { name: "Create your account" }).click();
  await expect(page).toHaveURL("/signup/organization");

  // Step 3: Fill organization details
  const effectiveSlug = slug ?? `test-${Date.now()}`;
  await page.getByRole("textbox", { name: "Organization name" }).fill("Test Organization");
  await page.getByRole("textbox", { name: "Subdomain" }).clear();
  await page.getByRole("textbox", { name: "Subdomain" }).fill(effectiveSlug);
  await page.getByRole("textbox", { name: "Country code" }).fill("ZAF");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL("/signup/verify");

  // Step 4: Enter verification code (auto-submits after 6 characters)
  await typeOneTimeCode(page, getVerificationCode());
  await page.waitForURL(`**/${effectiveSlug}/admin`);
  await expect(page.getByRole("dialog", { name: "User profile" })).toBeVisible();

  // Step 5: Complete profile setup and verify successful save
  await page.getByRole("textbox", { name: "First name" }).fill(user.firstName);
  await page.getByRole("textbox", { name: "Last name" }).fill(user.lastName);
  await page.getByRole("button", { name: "Save changes" }).click();
  await expectToastMessage(context, "Profile updated successfully");

  // Step 6: Wait for successful completion
  await expect(page.getByRole("heading", { name: "Welcome home" })).toBeVisible();

  // Step 7: Logout if requested (useful for login flow tests)
  if (!keepUserLoggedIn) {
    await page.getByRole("button", { name: "User profile menu" }).click();
    await page.getByRole("menuitem", { name: "Log out" }).click();
    await expect(page).toHaveURL(/\/login\?returnPath=/);
  }

  return { slug: effectiveSlug };
}
