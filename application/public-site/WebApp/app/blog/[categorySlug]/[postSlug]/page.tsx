import { ArrowLeft, Calendar, Folder } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicBlogPostBySlug } from "@/actions/blog.server";
import { getTenantSettings } from "@/actions/settings.server";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ categorySlug: string; postSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug, postSlug } = await params;
  try {
    const post = await getPublicBlogPostBySlug(categorySlug, postSlug);
    return {
      title: post.title,
      description: post.summary?.substring(0, 160) ?? post.content?.substring(0, 160),
      openGraph: {
        title: post.title,
        description: post.summary ?? "",
        type: "article",
        publishedTime: post.publishedAt ?? undefined
      }
    };
  } catch {
    return { title: "Post Not Found" };
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { categorySlug, postSlug } = await params;
  const settings = await getTenantSettings();
  const orgName = settings.brand.organizationName ?? "Fundraiser";

  let post;
  try {
    post = await getPublicBlogPostBySlug(categorySlug, postSlug);
  } catch {
    notFound();
  }

  if (!post) notFound();

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary ?? post.content?.substring(0, 160),
    datePublished: post.publishedAt,
    publisher: {
      "@type": "Organization",
      name: orgName
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <article className="container mx-auto px-4 py-12 max-w-3xl">
          {/* Back */}
          <Link
            href={`/blog/${categorySlug}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {post.categoryTitle ?? "category"}
          </Link>

          {/* Category badge */}
          {post.categoryTitle && (
            <Badge variant="secondary" className="mb-4 gap-1">
              <Folder className="h-3 w-3" />
              {post.categoryTitle}
            </Badge>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{post.title}</h1>

          {/* Meta */}
          {post.publishedAt && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-8">
              <Calendar className="h-4 w-4" />
              {new Date(post.publishedAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
            </div>
          )}

          {/* Summary */}
          {post.summary && (
            <p className="text-lg text-muted-foreground mb-8 border-l-4 border-[var(--tenant-primary)] pl-4 italic">
              {post.summary}
            </p>
          )}

          {/* Content */}
          {post.content && (
            <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
          )}
        </article>
      </main>
    </>
  );
}
