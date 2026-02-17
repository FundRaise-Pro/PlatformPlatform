"use server";

import { handleResponse } from "@/lib/api/utils";
import { apiUrl } from "@/lib/http";

export interface PublicStorySummary {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  featuredImageUrl: string | null;
  goalAmount: number;
  raisedAmount: number;
  fundraisingStatus: string;
}

export interface PublicStoryImage {
  id: string;
  blobUrl: string;
  mimeType: string;
  fileSizeBytes: number;
}

export interface PublicStoryUpdate {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface PublicStoryDetail {
  id: string;
  slug: string;
  title: string;
  content: string;
  summary: string | null;
  featuredImageUrl: string | null;
  goalAmount: number;
  raisedAmount: number;
  fundraisingStatus: string;
  campaignSlug: string | null;
  images: PublicStoryImage[];
  updates: PublicStoryUpdate[];
}

export async function getPublicStoriesByCampaignSlug(campaignSlug: string): Promise<PublicStorySummary[]> {
  const response = await fetch(apiUrl(`/api/fundraiser/public/campaigns/${campaignSlug}/stories`), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    next: { revalidate: 60 }
  });
  return handleResponse<PublicStorySummary[]>(response);
}

export async function getPublicStoryBySlug(slug: string): Promise<PublicStoryDetail> {
  const response = await fetch(apiUrl(`/api/fundraiser/public/stories/${slug}`), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    next: { revalidate: 60 }
  });
  return handleResponse<PublicStoryDetail>(response);
}
