"use server";

import { apiUrl } from "@/lib/http";
import { handleResponse } from "@/lib/api/utils";

export interface PublicCampaignSummary {
  slug: string;
  title: string;
  summary: string | null;
  featuredImageUrl: string | null;
  status: string;
  publishedAt: string | null;
  images: { id: string; blobUrl: string; mimeType: string; fileSizeBytes: number }[];
  tags: string[];
}

export interface PublicCampaign {
  slug: string;
  title: string;
  content: string;
  summary: string | null;
  featuredImageUrl: string | null;
  externalFundingUrl: string | null;
  status: string;
  publishedAt: string | null;
  images: { id: string; blobUrl: string; mimeType: string; fileSizeBytes: number }[];
  tags: string[];
}

// NOTE: The backend PublicCampaignSummaryResponse does NOT include goalAmount/raisedAmount
// fields. These may be added later as campaign funding tracking is implemented.

export async function getPublicCampaigns(): Promise<PublicCampaignSummary[]> {
  const response = await fetch(apiUrl("/api/fundraiser/public/campaigns"), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    next: { revalidate: 60 },
  });
  return handleResponse<PublicCampaignSummary[]>(response);
}

export async function getPublicCampaignBySlug(slug: string): Promise<PublicCampaign> {
  const response = await fetch(apiUrl(`/api/fundraiser/public/campaigns/${slug}`), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    next: { revalidate: 60 },
  });
  return handleResponse<PublicCampaign>(response);
}
