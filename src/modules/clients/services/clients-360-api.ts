import { BaseHttpService } from "@core/http/base-http.service";
import type { HttpClient } from "@core/http/interfaces/http-client.interface";
import type { Client360Bundle } from "@modules/clients/interfaces/client-360.model";

type Client360Response = {
  data?: Client360Bundle;
};

export type GetClient360BundleQuery = {
  search?: string;
  profilesLimit?: number;
  profilesOffset?: number;
  timelineLimit?: number;
  timelineOffset?: number;
  clientId?: string;
};

export class Clients360Api extends BaseHttpService {
  constructor(http: HttpClient) {
    super(http, { correlationNamespace: "clients-360-api" });
  }

  private toNonNegativeInt(value: unknown): number | undefined {
    if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
    if (value < 0) return undefined;
    return Math.floor(value);
  }

  private toPositiveInt(value: unknown): number | undefined {
    if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
    if (value <= 0) return undefined;
    return Math.floor(value);
  }

  async getBundle(
    workspaceId: string,
    options: GetClient360BundleQuery = {}
  ): Promise<Client360Bundle> {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "x-workspace-id": workspaceId,
    };
    const query: Record<string, string | number> = { workspaceId };

    if (options.search?.trim()) query.search = options.search.trim();

    const profilesLimit = this.toPositiveInt(options.profilesLimit);
    if (profilesLimit !== undefined) query.profilesLimit = profilesLimit;

    const profilesOffset = this.toNonNegativeInt(options.profilesOffset);
    if (profilesOffset !== undefined) query.profilesOffset = profilesOffset;

    const timelineLimit = this.toPositiveInt(options.timelineLimit);
    if (timelineLimit !== undefined) query.timelineLimit = timelineLimit;

    const timelineOffset = this.toNonNegativeInt(options.timelineOffset);
    if (timelineOffset !== undefined) query.timelineOffset = timelineOffset;

    if (options.clientId?.trim()) query.clientId = options.clientId.trim();

    const res = await this.get<Client360Response | Client360Bundle>(
      "/clients/internal/customer-360",
      query,
      headers
    );

    if (res && typeof res === "object" && "profiles" in res && "timeline" in res) {
      return res as Client360Bundle;
    }

    return (res as Client360Response)?.data as Client360Bundle;
  }
}

export default Clients360Api;
