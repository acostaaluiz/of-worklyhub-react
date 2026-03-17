import { BaseHttpService } from "@core/http/base-http.service";
import type { HttpClient, HttpQuery } from "@core/http/interfaces/http-client.interface";
import type {
  FinanceDashboardResponseApi,
  FinanceInsightsResponseApi,
} from "@modules/finance/interfaces/finance-dashboard.model";

export type FinanceEntryType = {
  id: string;
  key?: string;
  name: string;
  direction?: "income" | "expense";
  [key: string]: string | number | boolean | null | undefined;
};

export type FinanceEntryApiRow = {
  id?: string;
  serviceId?: string;
  service_id?: string;
  amount?: number | string;
  amount_cents?: number | string;
  occurred_at?: string;
  date?: string;
  created_at?: string;
  note?: string;
  description?: string;
  typeId?: string;
  type_id?: string;
  type_direction?: string;
  direction?: string;
  [key: string]: string | number | boolean | null | undefined;
};

export type FinanceEntriesQuery = {
  typeId?: string;
  start?: string;
  end?: string;
  limit?: number;
  offset?: number;
};

export type FinancePricingSuggestionApi = {
  service_id: string;
  service_name: string;
  current_price_cents: number;
  suggested_price_cents: number;
  delta_cents: number;
  expected_impact: "increase-margin" | "protect-demand" | "neutral";
  confidence: number;
  why: string;
  actions: Array<{
    id: string;
    label: string;
    kind:
      | "increase-price"
      | "decrease-price"
      | "bundle"
      | "monitor"
      | "collect-data";
  }>;
  historical_orders?: number;
  data_quality?: "low" | "medium" | "high";
  rationale?: string;
  evidence?: DataMap;
  origin?: "rules" | "ai";
};

export type FinancePricingSuggestionsResponseApi = {
  period: {
    start: string;
    end: string;
    label?: string | null;
  };
  summary: {
    total: number;
    increases: number;
    decreases: number;
    unchanged: number;
    with_history: number;
    without_history: number;
    high_confidence?: number;
    low_confidence?: number;
    low_data_quality?: number;
    actionable?: number;
    mean_absolute_delta_cents?: number;
    estimated_margin_uplift_cents?: number;
  };
  suggestions: FinancePricingSuggestionApi[];
  meta?: {
    engine_requested?: "rules" | "ai" | "hybrid";
    engine_used?: "rules" | "ai";
    fallback_used?: boolean;
    provider?: string | null;
    model?: string | null;
    ai_error?: string | null;
    copilot_version?: string | null;
  };
  generated_at?: string;
};

export class FinanceApi extends BaseHttpService {
  constructor(http: HttpClient) {
    super(http, { correlationNamespace: "finance-api" });
  }

  async listEntryTypes(workspaceId?: string): Promise<FinanceEntryType[]> {
    const headers = workspaceId ? { "x-workspace-id": workspaceId } : undefined;
    return this.get<FinanceEntryType[]>(`/finance/internal/entry-types`, undefined, headers).catch(() => []);
  }

  async createEntry(workspaceId: string | undefined, body: { typeId?: string; amount_cents: number | string; occurred_at: string; description?: string; workspaceId?: string }) {
    const headers: Record<string, string> = { "Content-Type": "application/json", Accept: "application/json" };
    if (workspaceId) headers["x-workspace-id"] = workspaceId;
    return this.post<{ id: string }>(`/finance/entries`, body, headers);
  }
  
  async listEntries(
    workspaceId?: string,
    query?: FinanceEntriesQuery
  ): Promise<FinanceEntryApiRow[]> {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (workspaceId) headers["x-workspace-id"] = workspaceId;
    return this.get<FinanceEntryApiRow[]>(`/finance/entries`, query, headers).catch(() => []);
  }

  async getRevenue(workspaceId?: string, params?: { period?: string; start?: string; end?: string }): Promise<{ revenue_cents: number; period?: string | null; start?: string | null; end?: string | null } | null> {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (workspaceId) headers["x-workspace-id"] = workspaceId;

    const query: HttpQuery = {};
    if (params?.period) query.period = params.period;
    if (params?.start) query.start = params.start;
    if (params?.end) query.end = params.end;

    try {
      const res = await this.get<{ revenue_cents: number; period?: string | null; start?: string | null; end?: string | null }>(`/finance/revenue`, query, headers);
      return res ?? null;
    } catch (err) {
      // fallback to internal path
      try {
        const res2 = await this.get<{ revenue_cents: number; period?: string | null; start?: string | null; end?: string | null }>(`/finance/internal/revenue`, query, headers);
        return res2 ?? null;
      } catch (e) {
        return null;
      }
    }
  }

  async getDashboard(
    workspaceId: string | undefined,
    query: {
      start: string;
      end: string;
      period?: string;
      bucket?: string;
      cashflowLimit?: number;
      topLimit?: number;
    }
  ): Promise<FinanceDashboardResponseApi> {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (workspaceId) headers["x-workspace-id"] = workspaceId;

    return this.get<FinanceDashboardResponseApi>(`/finance/dashboard`, query, headers);
  }

  async getInsights(
    workspaceId: string | undefined,
    query: {
      start: string;
      end: string;
      period?: string;
    }
  ): Promise<FinanceInsightsResponseApi> {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (workspaceId) headers["x-workspace-id"] = workspaceId;
    return this.get<FinanceInsightsResponseApi>(`/finance/internal/insights`, query, headers);
  }

  async getPricingSuggestions(
    workspaceId: string | undefined,
    query: {
      start?: string;
      end?: string;
      period?: string;
      limit?: number;
      engine?: "rules" | "ai" | "hybrid";
    }
  ): Promise<FinancePricingSuggestionsResponseApi | null> {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (workspaceId) headers["x-workspace-id"] = workspaceId;

    try {
      return await this.get<FinancePricingSuggestionsResponseApi>(
        `/finance/internal/pricing-suggestions`,
        query,
        headers
      );
    } catch {
      return null;
    }
  }
}

export default FinanceApi;
