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
  type_direction?: "income" | "expense";
  schedule_id?: string | null;
  related_entry_id?: string | null;
  metadata?: Record<string, unknown> | null;
  source?: "work-order" | "schedule" | "manual" | string;
  work_order_id?: string | null;
};

export type FinanceDashboardTopServiceApi = {
  service_id: string;
  service_name: string;
  orders: number;
  quantity: number;
  revenue_cents: number;
  avg_ticket_cents: number;
};

export type FinanceInsightPriorityApi = "high" | "medium" | "low";
export type FinanceInsightCategoryApi =
  | "margin"
  | "cost-control"
  | "revenue-mix"
  | "cashflow"
  | "growth";

export type FinanceInsightActionApi = {
  id: string;
  label: string;
  kind: "pricing" | "cost" | "marketing" | "operations" | "cashflow";
  target?: string | null;
};

export type FinanceInsightItemApi = {
  id: string;
  priority: FinanceInsightPriorityApi;
  category: FinanceInsightCategoryApi;
  title: string;
  description: string;
  evidence: Record<string, unknown>;
  actions: FinanceInsightActionApi[];
};

export type FinanceInsightsResponseApi = {
  period: {
    start: string;
    end: string;
    previous_start?: string | null;
    previous_end?: string | null;
    label?: string | null;
  };
  summary: {
    total: number;
    high: number;
    medium: number;
    low: number;
  };
  insights: FinanceInsightItemApi[];
  generated_at?: string;
};

export type FinanceDashboardResponseApi = {
  period: FinanceDashboardPeriodApi;
  kpis: FinanceDashboardKpisApi;
  variation: FinanceDashboardVariationApi;
  trend: FinanceDashboardTrendPointApi[];
  cashflow: FinanceDashboardCashflowItemApi[];
  top_services: FinanceDashboardTopServiceApi[];
};
