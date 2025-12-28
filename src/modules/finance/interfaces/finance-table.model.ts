export type FinanceCashflowRow = {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  type: "in" | "out";
  category: string;
  amount: number;
  status: "paid" | "pending";
};

export type FinanceTopServiceRow = {
  id: string;
  serviceName: string;
  orders: number;
  revenue: number;
  avgTicket: number;
};
