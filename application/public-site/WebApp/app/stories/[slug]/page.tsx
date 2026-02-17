import { Heart } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicStoryBySlug } from "@/actions/stories.server";
import { getTenantSettings } from "@/actions/settings.server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const dynamic = "force-dynamic";

interface StoryDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: StoryDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const story = await getPublicStoryBySlug(slug);
    return {
      title: story.title,
      description: story.summary?.slice(0, 160) ?? story.content?.slice(0, 160)
    };
  } catch {
    return { title: "Story not found" };
  }
}

export default async function StoryDetailPage({ params }: StoryDetailPageProps) {
  const { slug } = await params;
  const settings = await getTenantSettings();

  let story;
  try {
    story = await getPublicStoryBySlug(slug);
  } catch {
    notFound();
  }

  const progressPercentage = story.goalAmount > 0
    ? Math.min(100, (story.raisedAmount / story.goalAmount) * 100)
    : 0;

  const currencyFormatter = new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 0
  });

  return (
    <main className="min-h-screen bg-linear-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-200">
          {story.campaignSlug && (
            <div className="mb-4">
              <Link href={`/campaigns/${story.campaignSlug}`} className="text-primary hover:underline">
                ← Back to campaign
              </Link>
            </div>
          )}

          {story.featuredImageUrl && (
            <div className="mb-8 overflow-hidden rounded-xl">
              <img
                src={story.featuredImageUrl}
                alt={story.title}
                className="h-auto w-full object-cover"
                loading="lazy"
              />
            </div>
          )}

          <div className="mb-8">
            <div className="mb-4 flex items-center gap-3">
              <h1>{story.title}</h1>
              <Badge variant="secondary">{story.fundraisingStatus}</Badge>
            </div>
            {story.summary && (
              <div className="text-lg text-muted-foreground">{story.summary}</div>
            )}
          </div>

          {story.goalAmount > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="size-5 text-rose-500" />
                  Fundraising progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium">
                    {currencyFormatter.format(story.raisedAmount)} raised
                  </span>
                  <span className="text-muted-foreground">
                    of {currencyFormatter.format(story.goalAmount)} goal
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
                <div className="mt-2 text-right text-sm text-muted-foreground">
                  {progressPercentage.toFixed(0)}% complete
                </div>

                <div className="mt-4">
                  <Link
                    href={`/donate?targetType=Story&targetId=${story.id}&targetName=${encodeURIComponent(story.title)}`}
                    className="inline-flex h-(--control-height) cursor-pointer items-center rounded-md bg-primary px-6 text-primary-foreground transition-colors hover:bg-primary/90 active:bg-primary/70"
                  >
                    Donate to this story
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Story</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none whitespace-pre-wrap">{story.content}</div>
            </CardContent>
          </Card>

          {story.images.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {story.images.map((image) => (
                    <div key={image.id} className="overflow-hidden rounded-lg">
                      <img
                        src={image.blobUrl}
                        alt={story.title}
                        className="h-auto w-full object-cover transition-transform hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {story.updates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {story.updates.map((update) => (
                    <div key={update.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                      <div className="mb-2 flex items-center justify-between">
                        <h3>{update.title}</h3>
                        <span className="text-sm text-muted-foreground">
                          {new Date(update.createdAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                          })}
                        </span>
                      </div>
                      <div className="prose max-w-none whitespace-pre-wrap">{update.content}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
