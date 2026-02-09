import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPublicCampaigns } from "@/actions/campaigns.server";
import { getTenantSettings } from "@/actions/settings.server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getTenantSettings();
  const label = settings.content.campaignLabel;
  const orgName = settings.brand.organizationName ?? "Fundraiser";
  return {
    title: `${label}s`,
    description: `Browse active ${label.toLowerCase()}s from ${orgName}. Support our cause today.`,
  };
}

export default async function CampaignsPage() {
  const settings = await getTenantSettings();
  const { content } = settings;
  let campaigns: Awaited<ReturnType<typeof getPublicCampaigns>> = [];
  let error: string | null = null;

  try {
    campaigns = await getPublicCampaigns();
  } catch (err) {
    error = err instanceof Error ? err.message : `Failed to load ${content.campaignLabel.toLowerCase()}s`;
    console.error("Error loading campaigns:", err);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Our {content.campaignLabel}s
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Find a {content.causeType.toLowerCase()} that matters to you and make an impact
          </p>
        </div>

        {/* Error */}
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-center text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Empty */}
        {!error && campaigns.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No {content.campaignLabel.toLowerCase()}s available yet. Check back soon!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Grid */}
        {!error && campaigns.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign) => (
              <Link key={campaign.slug} href={`/campaigns/${campaign.slug}`}>
                <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer">
                  <CardHeader>
                    <Badge variant="secondary" className="w-fit mb-2">
                      Active
                    </Badge>
                    <CardTitle className="line-clamp-2">{campaign.title}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {campaign.summary}
                    </CardDescription>
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
        )}
      </div>
    </main>
  );
}
