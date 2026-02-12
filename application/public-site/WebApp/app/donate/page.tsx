import { ArrowRight, Heart, Megaphone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getPublicCampaigns } from "@/actions/campaigns.server";
import { getTenantSettings } from "@/actions/settings.server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getTenantSettings();
  const orgName = settings.brand.organizationName ?? "Fundraiser";
  return {
    title: `${settings.content.donationLabel}`,
    description: `Make a ${settings.content.donationLabel.toLowerCase()} to ${orgName} and make a real difference.`
  };
}

export default async function DonatePage() {
  const settings = await getTenantSettings();
  const { content, brand } = settings;
  const orgName = brand.organizationName ?? "Our Organisation";

  const campaigns = await getPublicCampaigns().catch(() => []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--tenant-primary)] to-[var(--tenant-secondary)] text-white">
        <div className="container mx-auto px-4 py-16 md:py-20 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Heart className="h-12 w-12 mx-auto mb-4 text-white/80" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{content.donationLabel}</h1>
            <p className="text-lg md:text-xl text-white/80 leading-relaxed">
              Your {content.donationLabel.toLowerCase()} to {orgName} helps us support more{" "}
              {content.beneficiaryLabel.toLowerCase()}s. Every contribution counts.
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

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Info card */}
        <Card className="mb-12 border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">How to {content.donationLabel}</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              {content.donationLabel} options will be configured by {orgName} and made available here. In the meantime,
              please contact us directly to discuss how you can support our {content.causeType.toLowerCase()}.
            </p>
            <Button asChild={true}>
              <Link href="/contact">
                Contact Us
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Active Campaigns */}
        {campaigns.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-[var(--tenant-primary)]" />
              Active {content.campaignLabel}s
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {campaigns.map((campaign) => (
                <Link key={campaign.slug} href={`/campaigns/${campaign.slug}`}>
                  <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer">
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{campaign.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{campaign.summary}</CardDescription>
                    </CardHeader>
                    {campaign.tags.length > 0 && (
                      <CardContent>
                        <div className="flex flex-wrap gap-1">
                          {campaign.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
