export type AiTokenSummaryModel = {
  userUid: string;
  planId?: number;
  planTitle?: string | null;
  monthlyAllocationTokens: number;
  monthlyBalanceTokens: number;
  topupBalanceTokens: number;
  totalBalanceTokens: number;
  cycleStartDate: string;
  cycleEndDate: string;
  nextRefillAt: string;
};

export type AiTokenLedgerEntryModel = {
  id: string;
  userUid: string;
  workspaceId?: string | null;
  sourceModule: "chat" | "finance" | "dashboard" | "users" | "billing" | "system";
  sourceFeature: string;
  entryType: "credit" | "debit" | "adjustment";
  amountTokens: number;
  balanceBeforeTokens: number;
  balanceAfterTokens: number;
  balanceBucket: "monthly" | "topup" | "mixed";
  reasonCode?: string | null;
  idempotencyKey?: string | null;
  metadata: DataMap;
  createdAt: string;
};

export type AiTokenLedgerResponseModel = {
  total: number;
  items: AiTokenLedgerEntryModel[];
};
