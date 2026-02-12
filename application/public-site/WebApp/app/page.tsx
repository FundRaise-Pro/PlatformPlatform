import { ArrowRight, Calendar, Heart, Megaphone } from "lucide-react";
import Link from "next/link";
import { getPublicBlogPosts } from "@/actions/blog.server";
import { getPublicCampaigns } from "@/actions/campaigns.server";
import { getPublicEvents } from "@/actions/events.server";
import { getTenantSettings } from "@/actions/settings.server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Homepage for the public storefront.
 *
 * Adapted from GOS-Dev's homepage but fully tenant-aware:
 * - Organisation name, tagline, and cause type from TenantSettings
 * - Recent campaigns, blog posts, events fetched from public API
 * - No hardcoded Gift of Sight content
 */
export default async function HomePage() {
  const settings = await getTenantSettings();
  const { brand, content } = settings;
  const orgName = brand.organizationName ?? "Our Organisation";

  // Fetch featured content in parallel
  const [campaigns, events, blogPosts] = await Promise.all([
    getPublicCampaigns().catch(() => []),
    getPublicEvents().catch(() => []),
    getPublicBlogPosts().catch(() => [])
  ]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--tenant-primary)] via-[var(--tenant-secondary)] to-[var(--tenant-primary)] text-white">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />
        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">{orgName}</h1>
            {brand.tagline && <p className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed">{brand.tagline}</p>}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild={true}>
                <Link href="/donate">
                  <Heart className="mr-2 h-4 w-4" />
                  {content.donationLabel}
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-black hover:bg-white/10" asChild={true}>
                <Link href="/campaigns">
                  View {content.campaignLabel}s
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              className="fill-white"
            />
          </svg>
        </div>
      </section>

      {/* Active Campaigns */}
      {campaigns.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <Badge className="mb-4">
              <Megaphone className="w-3 h-3 mr-1" />
              Active {content.campaignLabel}s
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold">Support Our {content.causeType}</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {campaigns.slice(0, 3).map((campaign) => (
              <Link key={campaign.slug} href={`/campaigns/${campaign.slug}`}>
                <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer">
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{campaign.title}</CardTitle>
                    <CardDescription className="line-clamp-3">{campaign.summary}</CardDescription>
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
          {campaigns.length > 3 && (
            <div className="text-center mt-8">
              <Button variant="outline" asChild={true}>
                <Link href="/campaigns">
                  View All {content.campaignLabel}s
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </section>
      )}

      {/* Upcoming Events */}
      {events.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <Badge variant="secondary" className="mb-4">
                <Calendar className="w-3 h-3 mr-1" />
                Upcoming Events
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold">Join Us</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.slice(0, 3).map((event) => (
                <Card key={event.slug} className="h-full">
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{event.name}</CardTitle>
                    <CardDescription>
                      {event.eventDate && (
                        <span className="flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(event.eventDate).toLocaleDateString(undefined, {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                          })}
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  {event.description && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">{event.description}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
            {events.length > 3 && (
              <div className="text-center mt-8">
                <Button variant="outline" asChild={true}>
                  <Link href="/events">
                    View All Events
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Latest Blog Posts */}
      {blogPosts.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold">Latest Updates</h2>
            <p className="text-muted-foreground mt-2">News and stories from {orgName}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogPosts.slice(0, 3).map((post) => (
              <Link key={post.slug} href={`/blog/${post.categorySlug}/${post.slug}`}>
                <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer">
                  <CardHeader>
                    {post.categoryTitle && (
                      <Badge variant="secondary" className="w-fit mb-2">
                        {post.categoryTitle}
                      </Badge>
                    )}
                    <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                    <CardDescription className="line-clamp-3">{post.summary}</CardDescription>
                  </CardHeader>
                  {post.publishedAt && (
                    <CardContent>
                      <span className="text-xs text-muted-foreground">
                        {new Date(post.publishedAt).toLocaleDateString()}
                      </span>
                    </CardContent>
                  )}
                </Card>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="outline" asChild={true}>
              <Link href="/blog">
                Read More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-br from-[var(--tenant-primary)] to-[var(--tenant-secondary)] text-white border-0 overflow-hidden relative">
          <CardContent className="p-8 md:p-12 relative z-10">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Make a Difference?</h2>
              <p className="text-white/80 mb-8 text-lg">
                Every {content.donationLabel.toLowerCase()} helps us reach more {content.beneficiaryLabel.toLowerCase()}
                s. Join us today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild={true}>
                  <Link href="/donate">
                    {content.donationLabel} Now
                    <Heart className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-black hover:bg-white/10"
                  asChild={true}
                >
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
