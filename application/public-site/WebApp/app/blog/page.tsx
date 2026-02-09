import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Folder } from "lucide-react";
import { getPublicBlogCategories, getPublicBlogPosts } from "@/actions/blog.server";
import { getTenantSettings } from "@/actions/settings.server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getTenantSettings();
  const orgName = settings.brand.organizationName ?? "Fundraiser";
  return {
    title: "Blog",
    description: `Read the latest stories, news, and updates from ${orgName}.`,
  };
}

export default async function BlogPage() {
  const settings = await getTenantSettings();
  const orgName = settings.brand.organizationName ?? "Our Organisation";

  let categories: Awaited<ReturnType<typeof getPublicBlogCategories>> = [];
  let posts: Awaited<ReturnType<typeof getPublicBlogPosts>> = [];
  let error: string | null = null;

  try {
    [categories, posts] = await Promise.all([
      getPublicBlogCategories().catch(() => []),
      getPublicBlogPosts(),
    ]);
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load blog";
    console.error("Error loading blog:", err);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Our Blog</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Stories, updates, and insights from {orgName}
          </p>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-4">Browse by Category</h2>
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <Link key={cat.slug} href={`/blog/${cat.slug}`}>
                  <Badge
                    variant="outline"
                    className="gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors cursor-pointer"
                  >
                    <Folder className="h-4 w-4" />
                    {cat.title}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-center text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Empty */}
        {!error && posts.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No blog posts available yet. Check back soon!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Blog Grid */}
        {!error && posts.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mb-6">Latest Posts</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => {
                const postUrl = `/blog/${post.categorySlug}/${post.slug}`;
                return (
                  <Link key={post.slug} href={postUrl}>
                    <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer">
                      <CardHeader>
                        {post.categoryTitle && (
                          <Badge variant="secondary" className="w-fit mb-2 gap-1">
                            <Folder className="h-3 w-3" />
                            {post.categoryTitle}
                          </Badge>
                        )}
                        <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                        <CardDescription className="line-clamp-3">
                          {post.summary || "Read more..."}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {post.publishedAt && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
