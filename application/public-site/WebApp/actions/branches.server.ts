"use server";

import { handleResponse } from "@/lib/api/utils";
import { apiUrl } from "@/lib/http";

export interface BranchService {
  id: number;
  description: string | null;
}

export interface PublicBranch {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2: string | null;
  area: string | null;
  suburb: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  googleMapsUrl: string | null;
  appleMapsUrl: string | null;
  phoneNumber: string | null;
  createdAt: string;
  modifiedAt: string | null;
  services: BranchService[];
}

export async function getPublicBranches(): Promise<PublicBranch[]> {
  const response = await fetch(apiUrl("/api/fundraiser/public/branches"), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    next: { revalidate: 60 }
  });
  return handleResponse<PublicBranch[]>(response);
}
