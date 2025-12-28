import type { FinanceKpiModel } from "./finance-kpi.model";
import type { FinanceSeries } from "./finance-series.model";
import type {
  FinanceCashflowRow,
  FinanceTopServiceRow,
} from "./finance-table.model";

export type FinanceResponseModel = {
  kpis: FinanceKpiModel[];

  revenueSeries: FinanceSeries;
  expensesSeries: FinanceSeries;
  profitSeries: FinanceSeries;

  expensesByCategory: Array<{
    id: string;
    category: string;
    value: number;
  }>;

  cashflow: FinanceCashflowRow[];
  topServices: FinanceTopServiceRow[];
};
