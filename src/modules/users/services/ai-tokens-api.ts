import { BaseHttpService } from "@core/http/base-http.service";
import type { HttpClient } from "@core/http/interfaces/http-client.interface";
import type {
  AiTokenLedgerResponseModel,
  AiTokenSummaryModel,
} from "@modules/users/interfaces/ai-token.model";

export class UsersAiTokensApi extends BaseHttpService {
  constructor(http: HttpClient) {
    super(http, { correlationNamespace: "users-ai-tokens-api" });
  }

  async getSummary(): Promise<{ summary: AiTokenSummaryModel }> {
    return this.get<{ summary: AiTokenSummaryModel }>("users/internal/users/ai/tokens/summary");
  }

  async getLedger(params?: {
    limit?: number;
    offset?: number;
  }): Promise<AiTokenLedgerResponseModel> {
    return this.get<AiTokenLedgerResponseModel>(
      "users/internal/users/ai/tokens/ledger",
      params
    );
  }
}

export default UsersAiTokensApi;
