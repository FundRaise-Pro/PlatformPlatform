import { ArrowLeft, Calendar, Folder } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getPublicBlogCategories, getPublicBlogPosts } from "@/actions/blog.server";
import { getTenantSettings } from "@/actions/settings.server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ categorySlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug } = await params;
  const settings = await getTenantSettings();
  const orgName = settings.brand.organizationName ?? "Fundraiser";

  // Try to find category name from categories list
  const categories = await getPublicBlogCategories().catch(() => []);
  const category = categories.find((c) => c.slug === categorySlug);
  const name = category?.title ?? categorySlug;

  return {
    title: `${name} | Blog`,
    description: `Browse ${name} posts from ${orgName}.`
  };
}

export default async function BlogCategoryPage({ params }: Props) {
  const { categorySlug } = await params;
  const settings = await getTenantSettings();
  const orgName = settings.brand.organizationName ?? "Our Organisation";

  let posts: Awaited<ReturnType<typeof getPublicBlogPosts>> = [];
  let categories: Awaited<ReturnType<typeof getPublicBlogCategories>> = [];
  let error: string | null = null;

  try {
    [posts, categories] = await Promise.all([
      getPublicBlogPosts(categorySlug),
      getPublicBlogCategories().catch(() => [])
    ]);
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load posts";
    console.error("Error loading category posts:", err);
  }

  const category = categories.find((c) => c.slug === categorySlug);
  const categoryName = category?.title ?? categorySlug;

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Back */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          All Posts
        </Link>

        {/* Header */}
        <div className="mb-12">
          <Badge variant="secondary" className="mb-4 gap-1">
            <Folder className="h-3 w-3" />
            Category
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight">{categoryName}</h1>
          <p className="mt-2 text-muted-foreground">
            Posts in {categoryName} from {orgName}
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
        {!error && posts.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No posts in this category yet. Check back soon!</p>
            </CardContent>
          </Card>
        )}

        {/* Grid */}
        {!error && posts.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${categorySlug}/${post.slug}`}>
                <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer">
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                    <CardDescription className="line-clamp-3">{post.summary || "Read more..."}</CardDescription>
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
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
