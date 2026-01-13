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
}

export default FinanceApi;
