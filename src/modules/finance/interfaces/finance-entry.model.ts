export type FinanceEntryType = "income" | "expense" | "fixed";

export interface FinanceEntryModel {
  id: string;
  type: FinanceEntryType;
  amountCents: number;
  description?: string;
  serviceId?: string;
  date: string; // ISO date
}

export type FinanceEntryCreatePayload = Omit<FinanceEntryModel, "id">;
