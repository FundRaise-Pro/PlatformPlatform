"use client";

import { createContext, type ReactNode, useContext } from "react";
import type { TenantSettings } from "@/lib/tenant-config";
import { DEFAULT_TENANT_SETTINGS } from "@/lib/tenant-config";

const TenantContext = createContext<TenantSettings>(DEFAULT_TENANT_SETTINGS);

export function TenantProvider({ settings, children }: { settings: TenantSettings; children: ReactNode }) {
  return <TenantContext.Provider value={settings}>{children}</TenantContext.Provider>;
}

export function useTenant(): TenantSettings {
  return useContext(TenantContext);
}

export function useBrand() {
  return useTenant().brand;
}

export function useContent() {
  return useTenant().content;
}

export function useFeatureFlag(flag: string): boolean {
  const { featureFlags } = useTenant();
  return featureFlags[flag] ?? false;
}
