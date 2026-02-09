import Link from "next/link";
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter, Globe } from "lucide-react";
import type { TenantSettings, SocialLink } from "@/lib/tenant-config";

interface FooterProps {
  settings: TenantSettings;
}

/** Map social platform names to Lucide icons */
const socialIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  twitter: Twitter,
  x: Twitter,
};

/**
 * Public storefront footer – tenant-aware.
 *
 * Ported from GOS-Dev footer:
 * - siteConfig.name → brand.organizationName
 * - siteConfig.social → brand.socialLinks[]
 * - Hardcoded quick links replaced by dynamic links
 */
export function Footer({ settings }: FooterProps) {
  const { brand, content } = settings;
  const currentYear = new Date().getFullYear();
  const orgName = brand.organizationName ?? "Organisation";
  const socialLinks = brand.socialLinks ?? [];

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12">
          {/* About Section */}
          <div className="space-y-4">
            <span className="font-bold text-lg text-primary">{orgName}</span>
            {brand.tagline && (
              <p className="text-sm text-muted-foreground">{brand.tagline}</p>
            )}
            {socialLinks.length > 0 && (
              <div className="flex space-x-4">
                {socialLinks.map((social: SocialLink) => {
                  const Icon = socialIconMap[social.platform.toLowerCase()] ?? Globe;
                  return (
                    <Link
                      key={social.platform}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground transition-colors hover:text-primary"
                      aria-label={social.platform}
                    >
                      <Icon className="size-5" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/campaigns"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {content.campaignLabel}s
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Contact Us
                </Link>
              </li>
              {brand.privacyUrl && (
                <li>
                  <Link
                    href={brand.privacyUrl}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Privacy Policy
                  </Link>
                </li>
              )}
              {brand.termsUrl && (
                <li>
                  <Link
                    href={brand.termsUrl}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Terms and Conditions
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Donate CTA */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider">
              Support Us
            </h3>
            <p className="text-sm text-muted-foreground">
              Your {content.donationLabel.toLowerCase()} makes a difference.
              Help us reach more {content.beneficiaryLabel.toLowerCase()}s.
            </p>
            <Link
              href="/donate"
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {content.donationLabel} Now
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <p className="text-center text-sm text-muted-foreground md:text-left">
              &copy; {currentYear} {orgName}. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {brand.privacyUrl && (
                <Link
                  href={brand.privacyUrl}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Privacy Policy
                </Link>
              )}
              {brand.termsUrl && (
                <Link
                  href={brand.termsUrl}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Terms of Service
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
