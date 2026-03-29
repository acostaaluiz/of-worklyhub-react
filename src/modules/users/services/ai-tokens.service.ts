import { BehaviorSubject } from "rxjs";

import { httpClient } from "@core/http/client.instance";
import { toAppError } from "@core/errors/to-app-error";
import type {
  AiTokenLedgerResponseModel,
  AiTokenSummaryModel,
} from "@modules/users/interfaces/ai-token.model";
import { UsersAiTokensApi } from "@modules/users/services/ai-tokens-api";

const EMPTY_SUMMARY: AiTokenSummaryModel = {
  userUid: "",
  monthlyAllocationTokens: 0,
  monthlyBalanceTokens: 0,
  topupBalanceTokens: 0,
  totalBalanceTokens: 0,
  cycleStartDate: "",
  cycleEndDate: "",
  nextRefillAt: "",
};

export class UsersAiTokensService {
  private readonly api = new UsersAiTokensApi(httpClient);
  private readonly summary$ = new BehaviorSubject<AiTokenSummaryModel>(EMPTY_SUMMARY);
  private pendingSummary: Promise<AiTokenSummaryModel> | null = null;

  getSummary$() {
    return this.summary$.asObservable();
  }

  getSummaryValue(): AiTokenSummaryModel {
    return this.summary$.getValue();
  }

  reset(): void {
    this.summary$.next(EMPTY_SUMMARY);
    this.pendingSummary = null;
  }

  private publishSummary(summary?: AiTokenSummaryModel | null): void {
    this.summary$.next(summary ?? EMPTY_SUMMARY);
  }

  async fetchSummary(): Promise<AiTokenSummaryModel> {
    if (this.pendingSummary) return this.pendingSummary;

    this.pendingSummary = (async (): Promise<AiTokenSummaryModel> => {
      try {
        const response = await this.api.getSummary();
        this.publishSummary(response.summary);
        return response.summary;
      } catch (err) {
        throw toAppError(err);
      } finally {
        this.pendingSummary = null;
      }
    })();

    return this.pendingSummary;
  }

  async listLedger(params?: {
    limit?: number;
    offset?: number;
  }): Promise<AiTokenLedgerResponseModel> {
    try {
      return await this.api.getLedger(params);
    } catch (err) {
      throw toAppError(err);
    }
  }
}

export const usersAiTokensService = new UsersAiTokensService();

export default usersAiTokensService;
