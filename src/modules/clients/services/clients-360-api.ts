import { BaseHttpService } from "@core/http/base-http.service";
import type { HttpClient } from "@core/http/interfaces/http-client.interface";
import type { Client360Bundle } from "@modules/clients/interfaces/client-360.model";

type Client360Response = {
  data?: Client360Bundle;
};

export class Clients360Api extends BaseHttpService {
  constructor(http: HttpClient) {
    super(http, { correlationNamespace: "clients-360-api" });
  }

  async getBundle(
    workspaceId: string,
    search?: string
  ): Promise<Client360Bundle> {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "x-workspace-id": workspaceId,
    };
    const query: Record<string, string> = { workspaceId };
    if (search?.trim()) query.search = search.trim();

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

