"use server";

import { handleResponse } from "@/lib/api/utils";
import { apiUrl } from "@/lib/http";

export interface CreatePublicTransactionRequest {
  name: string;
  description: string;
  type: string;
  amount: number;
  targetType: string;
  targetId: string;
  payeeName?: string;
  payeeEmail?: string;
  channel: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface CreatePublicTransactionResponse {
  transactionId: string;
  actionUrl: string;
  formFields: Record<string, string>;
}

export async function createPublicTransaction(
  request: CreatePublicTransactionRequest
): Promise<CreatePublicTransactionResponse> {
  const response = await fetch(apiUrl("/api/fundraiser/public/donate"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request)
  });
  return handleResponse<CreatePublicTransactionResponse>(response);
}
