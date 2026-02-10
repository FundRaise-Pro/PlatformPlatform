"use server";

import { apiUrl } from "@/lib/http";
import { handleResponse } from "@/lib/api/utils";
import type { TenantSettings } from "@/lib/tenant-config";
import { DEFAULT_TENANT_SETTINGS } from "@/lib/tenant-config";

/**
 * Fetch public tenant settings from the fundraiser API.
 *
 * Called during SSR in layout.tsx. The request goes through the YARP gateway
 * which injects the X-Tenant-Id header based on the subdomain, so this endpoint
 * knows which tenant's settings to return.
 *
 * Caches for 60 seconds via Next.js ISR.
 */
export async function getTenantSettings(): Promise<TenantSettings> {
  try {
    const response = await fetch(apiUrl("/api/fundraiser/public/settings"), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 60 },
    });
    return await handleResponse<TenantSettings>(response);
  } catch (error) {
    console.error("Failed to fetch tenant settings, using defaults:", error);
    return DEFAULT_TENANT_SETTINGS;
  }
}
