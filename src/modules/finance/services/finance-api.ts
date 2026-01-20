import { BaseHttpService } from "@core/http/base-http.service";
import type { HttpClient } from "@core/http/interfaces/http-client.interface";

export type FinanceEntryType = {
  id: string;
  key?: string;
  name: string;
  [key: string]: unknown;
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
  
  async listEntries(workspaceId?: string, query?: { typeId?: string; start?: string; end?: string; limit?: number; offset?: number }): Promise<unknown[]> {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (workspaceId) headers["x-workspace-id"] = workspaceId;
    return this.get<unknown[]>(`/finance/entries`, query, headers).catch(() => []);
  }

  async getRevenue(workspaceId?: string, params?: { period?: string; start?: string; end?: string }): Promise<{ revenue_cents: number; period?: string | null; start?: string | null; end?: string | null } | null> {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (workspaceId) headers["x-workspace-id"] = workspaceId;

    const query: Record<string, unknown> = {};
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
}

export default FinanceApi;
