export type FinanceDashboardPeriodApi = {
  start: string;
  end: string;
  previous_start?: string | null;
  previous_end?: string | null;
  bucket: "day" | "week" | "month";
  label?: string | null;
};

export type FinanceDashboardKpisApi = {
  revenue_cents: number;
  expense_cents: number;
  profit_cents: number;
  margin_pct: number;
};

export type FinanceDashboardVariationApi = {
  revenue_pct: number | null;
  expense_pct: number | null;
  profit_pct: number | null;
  margin_pct_points: number | null;
};

export type FinanceDashboardTrendPointApi = {
  bucket: string;
  revenue_cents: number;
};

export type FinanceDashboardCashflowItemApi = {
  id: string;
  occurred_at: string;
  description: string;
  amount_cents: number;
  type_id: string;
  type_name: string;
};

export type FinanceDashboardTopServiceApi = {
  service_id: string;
  service_name: string;
  orders: number;
  quantity: number;
  revenue_cents: number;
  avg_ticket_cents: number;
};

export type FinanceDashboardResponseApi = {
  period: FinanceDashboardPeriodApi;
  kpis: FinanceDashboardKpisApi;
  variation: FinanceDashboardVariationApi;
  trend: FinanceDashboardTrendPointApi[];
  cashflow: FinanceDashboardCashflowItemApi[];
  top_services: FinanceDashboardTopServiceApi[];
};
