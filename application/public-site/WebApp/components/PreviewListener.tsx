"use client";

import { useEffect } from "react";

interface PreviewSettingsMessage {
  type: "preview-settings";
  theme: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
  };
}

function isPreviewSettingsMessage(data: unknown): data is PreviewSettingsMessage {
  return (
    typeof data === "object" &&
    data !== null &&
    "type" in data &&
    (data as PreviewSettingsMessage).type === "preview-settings" &&
    "theme" in data
  );
}

export function PreviewListener() {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!isPreviewSettingsMessage(event.data)) return;

      const { primaryColor, secondaryColor, accentColor } = event.data.theme;
      const root = document.documentElement;

      if (primaryColor) root.style.setProperty("--tenant-primary", primaryColor);
      if (secondaryColor) root.style.setProperty("--tenant-secondary", secondaryColor);
      if (accentColor) root.style.setProperty("--tenant-accent", accentColor);
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}
