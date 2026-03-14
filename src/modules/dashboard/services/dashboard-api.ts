import { BaseHttpService } from "@core/http/base-http.service";
import type { HttpClient } from "@core/http/interfaces/http-client.interface";

type DashboardSummaryApi = {
  generatedAt: string;
  period: {
    start: string;
    end: string;
    bucket: "day" | "week" | "month";
    label?: string | null;
  };
  kpis: {
    revenueCents: number;
    profitCents: number;
    expenseCents: number;
    marginPct: number;
    avgTicketCents: number;
    servicesCompleted: number;
    appointmentsToday: number;
    openWorkOrders: number;
    activeWorkers: number;
    completionRatePct: number;
  };
  variation: {
    revenuePct: number | null;
    profitPct: number | null;
    expensePct: number | null;
    marginPctPoints: number;
  };
  topServices: Array<{
    serviceId: string;
    serviceName: string;
    orders: number;
    quantity: number;
    revenueCents: number;
    avgTicketCents: number;
  }>;
};

type DashboardTrendApi = {
  generatedAt: string;
  period: {
    start: string;
    end: string;
    bucket: "day" | "week" | "month";
    label?: string | null;
  };
  series: Array<{
    bucket: string;
    revenueCents: number;
    profitCents: number;
  }>;
};

type DashboardAlertsApi = {
  generatedAt: string;
  period: {
    start: string;
    end: string;
    bucket: "day" | "week" | "month";
    label?: string | null;
  };
  summary: {
    total: number;
    high: number;
    medium: number;
    low: number;
  };
  alerts: Array<{
    id: string;
    source: "finance" | "work-order" | "schedule" | "people";
    priority: "high" | "medium" | "low";
    title: string;
    description: string;
    suggestedAction: string;
    evidence?: DataMap;
    origin?: "rules" | "ai";
    confidence?: number | null;
    rationale?: string | null;
    engineUsed?: "rules" | "ai" | null;
  }>;
};

export type DashboardApiQuery = {
  start: string;
  end: string;
  bucket?: "day" | "week" | "month";
  period?: string;
};

export class DashboardApi extends BaseHttpService {
  constructor(http: HttpClient) {
    super(http, { correlationNamespace: "dashboard-api" });
  }

  private buildHeaders(workspaceId?: string): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (workspaceId) headers["x-workspace-id"] = workspaceId;
    return headers;
  }

  async getSummary(
    workspaceId: string | undefined,
    query: DashboardApiQuery
  ): Promise<DashboardSummaryApi> {
    return this.get<DashboardSummaryApi>(
      "/dashboard/internal/summary",
      query,
      this.buildHeaders(workspaceId)
    );
  }

  async getTrend(
    workspaceId: string | undefined,
    query: DashboardApiQuery
  ): Promise<DashboardTrendApi> {
    return this.get<DashboardTrendApi>(
      "/dashboard/internal/trend",
      query,
      this.buildHeaders(workspaceId)
    );
  }

  async getAlerts(
    workspaceId: string | undefined,
    query: DashboardApiQuery
  ): Promise<DashboardAlertsApi> {
    return this.get<DashboardAlertsApi>(
      "/dashboard/internal/alerts",
      query,
      this.buildHeaders(workspaceId)
    );
  }
}

export default DashboardApi;
