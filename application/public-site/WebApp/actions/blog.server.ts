"use server";

import { handleResponse } from "@/lib/api/utils";
import { apiUrl } from "@/lib/http";

export interface PublicBlogCategory {
  title: string;
  slug: string;
  description: string | null;
  displayOrder: number;
}

export interface PublicBlogPostSummary {
  slug: string;
  title: string;
  summary: string | null;
  featuredImageUrl: string | null;
  categorySlug: string;
  categoryTitle: string;
  publishedAt: string | null;
  tags: string[];
}

export interface PublicBlogPost {
  slug: string;
  title: string;
  content: string;
  summary: string | null;
  featuredImageUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  categorySlug: string;
  categoryTitle: string;
  publishedAt: string | null;
  createdAt: string;
  tags: string[];
}

export async function getPublicBlogCategories(): Promise<PublicBlogCategory[]> {
  const response = await fetch(apiUrl("/api/fundraiser/public/blog/categories"), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    next: { revalidate: 60 }
  });
  return handleResponse<PublicBlogCategory[]>(response);
}

export async function getPublicBlogPosts(categorySlug?: string): Promise<PublicBlogPostSummary[]> {
  const url = categorySlug
    ? `/api/fundraiser/public/blog?categorySlug=${encodeURIComponent(categorySlug)}`
    : "/api/fundraiser/public/blog";
  const response = await fetch(apiUrl(url), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    next: { revalidate: 60 }
  });
  return handleResponse<PublicBlogPostSummary[]>(response);
}

export async function getPublicBlogPostBySlug(categorySlug: string, postSlug: string): Promise<PublicBlogPost> {
  const response = await fetch(apiUrl(`/api/fundraiser/public/blog/${categorySlug}/${postSlug}`), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    next: { revalidate: 60 }
  });
  return handleResponse<PublicBlogPost>(response);
}
