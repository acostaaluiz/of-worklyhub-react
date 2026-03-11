import { BaseHttpService } from "@core/http/base-http.service";
import type { HttpClient, HttpQuery } from "@core/http/interfaces/http-client.interface";
import type { GrowthOpportunityStatus, GrowthPlaybook } from "@modules/growth/interfaces/growth.model";

export type GrowthOpportunitiesApiQuery = {
  workspaceId: string;
  search?: string;
  status?: GrowthOpportunityStatus;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
};

export type GrowthOpportunitiesApiResponse = {
  items?: DataValue[];
  opportunities?: DataValue[];
  pagination?: {
    total?: number;
    offset?: number;
    limit?: number;
    hasMore?: boolean;
  };
};

export type GrowthSummaryApiResponse = {
  workspaceId?: string;
  windowStart?: string;
  windowEnd?: string;
  dispatchedCount?: number;
  convertedCount?: number;
  conversionRatePercent?: number;
  recoveredRevenueCents?: number;
  averageHoursToConvert?: number;
};

export type GrowthPlaybooksApiResponse = {
  items?: DataValue[];
  playbooks?: DataValue[];
};

export type GrowthUpsertPlaybooksPayload = {
  workspaceId: string;
  actorUid?: string;
  playbooks: GrowthPlaybook[];
};

export type GrowthDispatchPayload = {
  workspaceId: string;
  actorUid?: string;
  playbookId?: string;
  opportunityIds: string[];
};

export type GrowthDispatchApiResponse = {
  dispatchedCount?: number;
};

export class GrowthApi extends BaseHttpService {
  constructor(http: HttpClient) {
    super(http, { correlationNamespace: "growth-api" });
  }

  async listOpportunities(query: GrowthOpportunitiesApiQuery): Promise<GrowthOpportunitiesApiResponse> {
    const params: HttpQuery = {
      workspaceId: query.workspaceId,
      search: query.search,
      status: query.status,
      from: query.from,
      to: query.to,
      limit: query.limit,
      offset: query.offset,
    };
    return this.get<GrowthOpportunitiesApiResponse>("/growth/internal/opportunities", params);
  }

  async getAttributionSummary(
    workspaceId: string,
    query?: Pick<GrowthOpportunitiesApiQuery, "from" | "to">
  ): Promise<GrowthSummaryApiResponse> {
    return this.get<GrowthSummaryApiResponse>("/growth/internal/attribution/summary", {
      workspaceId,
      from: query?.from,
      to: query?.to,
    });
  }

  async listPlaybooks(workspaceId: string): Promise<GrowthPlaybooksApiResponse> {
    return this.get<GrowthPlaybooksApiResponse>("/growth/internal/playbooks", { workspaceId });
  }

  async upsertPlaybooks(payload: GrowthUpsertPlaybooksPayload): Promise<GrowthPlaybooksApiResponse> {
    return this.post<GrowthPlaybooksApiResponse, GrowthUpsertPlaybooksPayload>(
      "/growth/internal/playbooks",
      payload
    );
  }

  async dispatch(payload: GrowthDispatchPayload): Promise<GrowthDispatchApiResponse> {
    return this.post<GrowthDispatchApiResponse, GrowthDispatchPayload>(
      "/growth/internal/dispatch",
      payload
    );
  }
}

export default GrowthApi;
