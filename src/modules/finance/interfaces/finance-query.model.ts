import type { FinanceGroupBy } from "./finance-groupby.model";

export type FinanceView =
  | "overview"
  | "revenue"
  | "expenses"
  | "profit"
  | "cashflow";

export type FinanceQueryModel = {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
  groupBy: FinanceGroupBy;
  view: FinanceView;
};
