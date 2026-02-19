import { FundraiserConfig } from "@/types";

export type CampaignAllocation = FundraiserConfig["campaigns"][number]["partnerPool"]["allocations"][number];

export type AllocationDraft = {
  targetType: "fundraiser" | "campaign-ops";
  targetFundraiserId: string;
  targetLabel: string;
  amount: string;
  percentageSplit: string;
  reason: string;
  operationalCritical: boolean;
  donorIntentConfirmed: boolean;
  boardResolutionReference: string;
};

export function resolveAllocationRiskBand(lowMax: number, mediumMax: number, highMax: number, effectiveAmount: number) {
  if (effectiveAmount <= lowMax) {
    return "low" as const;
  }
  if (effectiveAmount <= mediumMax) {
    return "medium" as const;
  }
  if (effectiveAmount <= highMax) {
    return "high" as const;
  }
  return "critical" as const;
}

export function requiredAllocationApprovalsForBand(
  riskBand: CampaignAllocation["riskBand"],
): CampaignAllocation["approvals"] {
  if (riskBand === "low") {
    return [{ role: "campaign-admin", approved: false }];
  }
  if (riskBand === "medium") {
    return [
      { role: "campaign-admin", approved: false },
      { role: "finance-officer", approved: false },
    ];
  }
  if (riskBand === "high") {
    return [
      { role: "campaign-admin", approved: false },
      { role: "finance-officer", approved: false },
      { role: "board-member", approved: false },
    ];
  }
  return [
    { role: "full-board", approved: false },
    { role: "chair-president", approved: false },
  ];
}

export function hasAllocationApprovalsCompleted(allocation: CampaignAllocation): boolean {
  return allocation.approvals.every((approval) => approval.approved);
}

export function isAllocationCoolingOffComplete(allocation: CampaignAllocation, now: Date): boolean {
  if (allocation.riskBand !== "high") {
    return true;
  }

  if (!allocation.cooldownUntil) {
    return false;
  }

  return now >= new Date(allocation.cooldownUntil);
}

export function canTransitionAllocationStatus(
  allocation: CampaignAllocation,
  nextStatus: CampaignAllocation["status"],
  now: Date,
): boolean {
  if (allocation.status === "executed" && nextStatus !== "executed") {
    return false;
  }

  if (nextStatus === "cooling-off") {
    return allocation.riskBand === "high" && hasAllocationApprovalsCompleted(allocation);
  }

  if (nextStatus === "pending-approval") {
    return allocation.status !== "executed";
  }

  if (nextStatus === "approved" || nextStatus === "executed") {
    return hasAllocationApprovalsCompleted(allocation) && isAllocationCoolingOffComplete(allocation, now);
  }

  if (nextStatus === "rejected") {
    return allocation.status !== "executed";
  }

  return true;
}
