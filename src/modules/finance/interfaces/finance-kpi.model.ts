export type FinanceKpiModel = {
  id: "revenue" | "expenses" | "profit" | "margin";
  label: string;
  value: number;
  format: "money" | "number" | "percent";
  delta?: number;
};
