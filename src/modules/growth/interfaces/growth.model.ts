export type GrowthOpportunityStatus =
  | "new"
  | "queued"
  | "sent"
  | "converted"
  | "archived";

export type GrowthOpportunitySourceModule =
  | "clients"
  | "schedule"
  | "work-order"
  | "finance";

export type GrowthChannel = "email" | "whatsapp" | "sms";

export type GrowthOpportunity = {
  id: string;
  workspaceId: string;
  clientName: string;
  clientEmail?: string | null;
  clientPhone?: string | null;
  title: string;
  summary?: string | null;
  status: GrowthOpportunityStatus;
  sourceModule: GrowthOpportunitySourceModule;
  expectedValueCents?: number | null;
  confidenceScore?: number | null;
  lastInteractionAt?: string | null;
  dueAt?: string | null;
  createdAt: string;
};

export type GrowthPlaybook = {
  id: string;
  workspaceId: string;
  title: string;
  description?: string | null;
  enabled: boolean;
  channels: GrowthChannel[];
  goal: "reactivation" | "upsell" | "recovery";
  delayHours: number;
  maxTouches: number;
  updatedAt?: string | null;
};

export type GrowthAttributionSummary = {
  workspaceId: string;
  windowStart: string;
  windowEnd: string;
  dispatchedCount: number;
  convertedCount: number;
  conversionRatePercent: number;
  recoveredRevenueCents: number;
  averageHoursToConvert?: number | null;
};

export type GrowthDashboardBundle = {
  workspaceId: string;
  source: "backend" | "fallback";
  generatedAt: string;
  opportunities: GrowthOpportunity[];
  playbooks: GrowthPlaybook[];
  summary: GrowthAttributionSummary;
};

export type GrowthDashboardQuery = {
  workspaceId?: string;
  search?: string;
  status?: GrowthOpportunityStatus | "all";
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
};

export type GrowthDispatchResult = {
  workspaceId: string;
  dispatchedCount: number;
  source: "backend" | "fallback";
};
