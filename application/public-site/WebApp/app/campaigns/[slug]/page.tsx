import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart } from "lucide-react";
import { getPublicCampaignBySlug } from "@/actions/campaigns.server";
import { getTenantSettings } from "@/actions/settings.server";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const campaign = await getPublicCampaignBySlug(slug);
    const settings = await getTenantSettings();
    const orgName = settings.brand.organizationName ?? "Fundraiser";
    return {
      title: campaign.title,
      description: campaign.summary?.substring(0, 160) ?? `Support this ${settings.content.campaignLabel.toLowerCase()} at ${orgName}`,
    };
  } catch {
    return { title: "Not Found" };
  }
}

export default async function CampaignDetailPage({ params }: Props) {
  const { slug } = await params;
  const settings = await getTenantSettings();
  const { content } = settings;

  let campaign;
  try {
    campaign = await getPublicCampaignBySlug(slug);
  } catch {
    notFound();
  }

  if (!campaign) notFound();

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Back Link */}
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          All {content.campaignLabel}s
        </Link>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          {campaign.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap gap-3 mb-8">
          {campaign.publishedAt && (
            <Badge variant="outline" className="gap-1">
              Published {new Date(campaign.publishedAt).toLocaleDateString()}
            </Badge>
          )}
          {campaign.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Summary */}
        {campaign.summary && (
          <p className="text-lg text-muted-foreground mb-8 border-l-4 border-[var(--tenant-primary)] pl-4 italic">
            {campaign.summary}
          </p>
        )}

        {/* Content */}
        {campaign.content && (
          <div
            className="prose prose-lg max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: campaign.content }}
          />
        )}

        {/* Images */}
        {campaign.images.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 mb-8">
            {campaign.images.map((img) => (
              <img
                key={img.id}
                src={img.blobUrl}
                alt={campaign.title}
                className="rounded-lg w-full object-cover"
              />
            ))}
          </div>
        )}

        {/* External Funding Link */}
        {campaign.externalFundingUrl && (
          <Card className="mb-8">
            <CardContent className="pt-6 text-center">
              <Button size="lg" asChild>
                <a href={campaign.externalFundingUrl} target="_blank" rel="noopener noreferrer">
                  <Heart className="mr-2 h-4 w-4" />
                  {content.donationLabel} to this {content.campaignLabel}
                </a>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" asChild>
            <Link href="/donate">
              <Heart className="mr-2 h-4 w-4" />
              {content.donationLabel}
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
