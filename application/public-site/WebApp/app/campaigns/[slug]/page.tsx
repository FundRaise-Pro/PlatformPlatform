import { ArrowLeft, Heart } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicCampaignBySlug } from "@/actions/campaigns.server";
import { getTenantSettings } from "@/actions/settings.server";
import { getPublicStoriesByCampaignSlug } from "@/actions/stories.server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

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
      description:
        campaign.summary?.substring(0, 160) ??
        `Support this ${settings.content.campaignLabel.toLowerCase()} at ${orgName}`
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

  let stories: Awaited<ReturnType<typeof getPublicStoriesByCampaignSlug>> = [];
  try {
    stories = await getPublicStoriesByCampaignSlug(slug);
  } catch {
    // Stories may not be available; gracefully degrade
  }

  const currencyFormatter = new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 0
  });

  return (
    <main className="min-h-screen bg-linear-to-b from-white to-gray-50">
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
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{campaign.title}</h1>

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
          <p className="text-lg text-muted-foreground mb-8 border-l-4 border-(--tenant-primary) pl-4 italic">
            {campaign.summary}
          </p>
        )}

        {/* Content */}
        {campaign.content && (
          <div className="prose prose-lg max-w-none mb-8" dangerouslySetInnerHTML={{ __html: campaign.content }} />
        )}

        {/* Images */}
        {campaign.images.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 mb-8">
            {campaign.images.map((img) => (
              <img key={img.id} src={img.blobUrl} alt={campaign.title} className="rounded-lg w-full object-cover" />
            ))}
          </div>
        )}

        {/* Stories Section */}
        {stories.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4">Stories</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {stories.map((story) => {
                const storyProgress = story.goalAmount > 0
                  ? Math.min(100, (story.raisedAmount / story.goalAmount) * 100)
                  : 0;
                return (
                  <Link key={story.id} href={`/stories/${story.slug}`}>
                    <Card className="h-full cursor-pointer transition-shadow hover:shadow-lg">
                      {story.featuredImageUrl && (
                        <div className="overflow-hidden rounded-t-xl">
                          <img
                            src={story.featuredImageUrl}
                            alt={story.title}
                            className="h-48 w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className="line-clamp-2">{story.title}</CardTitle>
                        {story.summary && (
                          <CardDescription className="line-clamp-2">{story.summary}</CardDescription>
                        )}
                      </CardHeader>
                      {story.goalAmount > 0 && (
                        <CardContent>
                          <div className="mb-1 flex justify-between text-sm">
                            <span className="font-medium">
                              {currencyFormatter.format(story.raisedAmount)}
                            </span>
                            <span className="text-muted-foreground">
                              of {currencyFormatter.format(story.goalAmount)}
                            </span>
                          </div>
                          <Progress value={storyProgress} className="h-2" />
                        </CardContent>
                      )}
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* External Funding Link */}
        {campaign.externalFundingUrl && (
          <Card className="mb-8">
            <CardContent className="pt-6 text-center">
              <Button size="lg" asChild={true}>
                <a href={campaign.externalFundingUrl} target="_blank" rel="noopener noreferrer">
                  <Heart className="mr-2 size-4" />
                  {content.donationLabel} to this {content.campaignLabel}
                </a>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" asChild={true}>
            <Link href={`/donate?targetType=Campaign&targetId=${campaign.slug}&targetName=${encodeURIComponent(campaign.title)}`}>
              <Heart className="mr-2 size-4" />
              {content.donationLabel}
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
