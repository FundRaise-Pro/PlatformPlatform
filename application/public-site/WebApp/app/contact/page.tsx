import { Globe, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getPublicBranches } from "@/actions/branches.server";
import { getTenantSettings } from "@/actions/settings.server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getTenantSettings();
  const orgName = settings.brand.organizationName ?? "Fundraiser";
  return {
    title: "Contact Us",
    description: `Get in touch with ${orgName}. Find our locations and contact details.`
  };
}

export default async function ContactPage() {
  const settings = await getTenantSettings();
  const { brand, content } = settings;
  const orgName = brand.organizationName ?? "Our Organisation";

  let branches: Awaited<ReturnType<typeof getPublicBranches>> = [];
  let error: string | null = null;

  try {
    branches = await getPublicBranches();
  } catch (err) {
    error = err instanceof Error ? err.message : `Failed to load ${content.branchLabel.toLowerCase()}s`;
    console.error("Error loading branches:", err);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--tenant-primary)] via-[var(--tenant-secondary)] to-[var(--tenant-primary)] text-white">
        <div className="container mx-auto px-4 py-16 md:py-20 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
              <MessageCircle className="w-3 h-3 mr-1" />
              Get in Touch
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Contact Us</h1>
            <p className="text-lg md:text-xl text-white/80 leading-relaxed">
              We&apos;d love to hear from you. Reach out to {orgName} any time.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              className="fill-white"
            />
          </svg>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Social Links */}
        {brand.socialLinks && brand.socialLinks.length > 0 && (
          <div className="flex justify-center gap-6 mb-12">
            {brand.socialLinks.map((social) => (
              <Link
                key={social.platform}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Globe className="h-4 w-4" />
                {social.platform}
              </Link>
            ))}
          </div>
        )}

        {/* Branches / Locations */}
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-center text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {!error && branches.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Our {content.branchLabel}s</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {branches.map((branch) => (
                <Card key={branch.id} className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{branch.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {branch.addressLine1 && (
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="text-sm text-muted-foreground">
                          <p>{branch.addressLine1}</p>
                          {branch.addressLine2 && <p>{branch.addressLine2}</p>}
                          {branch.suburb && <p>{branch.suburb}</p>}
                          <p>{[branch.city, branch.state, branch.postalCode].filter(Boolean).join(", ")}</p>
                        </div>
                      </div>
                    )}
                    {branch.phoneNumber && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                        <a
                          href={`tel:${branch.phoneNumber}`}
                          className="text-sm hover:text-foreground transition-colors"
                        >
                          {branch.phoneNumber}
                        </a>
                      </div>
                    )}

                    {/* Branch services */}
                    {branch.services && branch.services.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-2">
                        {branch.services.map((service) => (
                          <Badge key={service.id} variant="outline" className="text-xs">
                            {service.description}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* General contact CTA */}
        <section className="text-center">
          <Card className="bg-gradient-to-br from-[var(--tenant-primary)] to-[var(--tenant-secondary)] text-white border-0">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-2">Have Questions?</h2>
              <p className="text-white/80 mb-6">
                We&apos;re here to help. Reach out to any of our {content.branchLabel.toLowerCase()}s above or connect
                with us on social media.
              </p>
              <Button variant="secondary" size="lg" asChild={true}>
                <Link href="/donate">Support {orgName}</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
