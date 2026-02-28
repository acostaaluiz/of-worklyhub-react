import type { FinanceKpiModel } from "./finance-kpi.model";
import type { FinanceSeries } from "./finance-series.model";
import type {
  FinanceCashflowRow,
  FinanceTopServiceRow,
} from "./finance-table.model";
import type { FinanceInsightModel } from "./finance-insights.model";

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
  insights: FinanceInsightModel[];
};
