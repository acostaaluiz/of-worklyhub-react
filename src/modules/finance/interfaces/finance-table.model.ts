export type FinanceCashflowRow = {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  type: "in" | "out";
  category: string;
  amount: number;
  status: "paid" | "pending";
  source?: "work-order" | "schedule" | "manual" | string;
  workOrderId?: string | null;
  scheduleId?: string | null;
  relatedEntryId?: string | null;
  metadata?: DataMap | null;
};

export type FinanceTopServiceRow = {
  id: string;
  serviceName: string;
  orders: number;
  revenue: number;
  avgTicket: number;
};
