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

export type FinanceEntryListItem = {
  id: string;
  serviceId?: string;
  amount: number;
  date: string;
  note?: string;
  description?: string;
  type?: string;
  typeId?: string;
};
