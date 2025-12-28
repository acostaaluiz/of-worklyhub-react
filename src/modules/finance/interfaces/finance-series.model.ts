export type FinancePoint = {
  label: string;
  value: number;
};

export type FinanceSeries = {
  key: "revenue" | "expenses" | "profit";
  points: FinancePoint[];
};
