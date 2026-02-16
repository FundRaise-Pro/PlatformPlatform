import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { getTenantSettings } from "@/actions/settings.server";
import { Footer } from "@/components/navigation/footer";
import { Navbar } from "@/components/navigation/navbar";
import { PreviewListener } from "@/components/PreviewListener";
import type { TenantSettings } from "@/lib/tenant-config";
import { TenantProvider } from "@/providers/tenant-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap"
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap"
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5
};

/**
 * Generate <style> block that maps tenant ThemeConfig into CSS custom properties.
 * These override the defaults in globals.css so every shadcn/ui component
 * automatically picks up the tenant's brand colours.
 */
function buildThemeCss(settings: TenantSettings): string {
  const { primaryColor, secondaryColor, accentColor, customCss } = settings.theme;
  // Inject tenant brand colours as CSS custom properties.
  // Components use var(--tenant-primary) etc. where needed beyond the shadcn theme.
  return `
    :root {
      --tenant-primary: ${primaryColor};
      --tenant-secondary: ${secondaryColor};
      --tenant-accent: ${accentColor};
    }
    ${customCss ?? ""}
  `;
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getTenantSettings();
  const orgName = settings.brand.organizationName ?? "Fundraiser";

  return {
    title: {
      default: orgName,
      template: `%s | ${orgName}`
    },
    description: settings.brand.tagline ?? `Welcome to ${orgName}`,
    robots: { index: true, follow: true }
  };
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getTenantSettings();
  const themeCss = buildThemeCss(settings);

  return (
    <html lang="en" dir="ltr">
      <head>
        {/* Inject tenant theme as CSS custom properties */}
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
        {/* Optional custom font */}
        {settings.theme.fontUrl && <link rel="stylesheet" href={settings.theme.fontUrl} />}
        {/* Optional favicon */}
        {settings.theme.faviconUrl && <link rel="icon" href={settings.theme.faviconUrl} />}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <TenantProvider settings={settings}>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 overflow-hidden">{children}</main>
            <Footer settings={settings} />
          </div>
        </TenantProvider>
        <Toaster position="top-center" richColors={true} />
        <PreviewListener />
      </body>
    </html>
  );
}
