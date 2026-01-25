import { BaseHttpService } from "@core/http/base-http.service";
import type { HttpClient } from "@core/http/interfaces/http-client.interface";
import type { SlaApiItem } from "@modules/slas/interfaces/sla.model";

export type SlasListQuery = {
  userUid?: string;
  eventId?: string;
  from?: string;
  to?: string;
};

export type SlasListResponse = {
  slas: SlaApiItem[];
};

export class SlasApi extends BaseHttpService {
  constructor(http: HttpClient) {
    super(http, { correlationNamespace: "slas-api" });
  }

  async listWorkspaceSlas(
    workspaceId: string,
    query?: SlasListQuery
  ): Promise<SlasListResponse> {
    const params: Record<string, string> = {};
    if (query?.userUid) params.userUid = query.userUid;
    if (query?.eventId) params.eventId = query.eventId;
    if (query?.from) params.from = query.from;
    if (query?.to) params.to = query.to;

    return this.get<SlasListResponse>(
      `/company/internal/workspaces/${workspaceId}/slas`,
      params
    );
  }
}

export default SlasApi;
