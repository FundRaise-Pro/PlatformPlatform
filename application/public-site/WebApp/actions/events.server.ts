"use server";

import { handleResponse } from "@/lib/api/utils";
import { apiUrl } from "@/lib/http";

export interface PublicEvent {
  slug: string;
  name: string;
  description: string;
  eventDate: string;
  location: string | null;
  targetAmount: number;
  raisedAmount: number;
  imageUrl: string | null;
  status: string;
}

// NOTE: Backend uses `name` (not `title`) and `eventDate` (not `startDate`).

export async function getPublicEvents(): Promise<PublicEvent[]> {
  const response = await fetch(apiUrl("/api/fundraiser/public/events"), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    next: { revalidate: 60 }
  });
  return handleResponse<PublicEvent[]>(response);
}
