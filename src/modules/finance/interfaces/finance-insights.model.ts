export type FinanceInsightPriority = "high" | "medium" | "low";

export type FinanceInsightCategory =
  | "margin"
  | "cost-control"
  | "revenue-mix"
  | "cashflow"
  | "growth";

export type FinanceInsightAction = {
  id: string;
  label: string;
  kind: "pricing" | "cost" | "marketing" | "operations" | "cashflow";
  target?: string | null;
};

export type FinanceInsightModel = {
  id: string;
  priority: FinanceInsightPriority;
  category: FinanceInsightCategory;
  title: string;
  description: string;
  evidence: Record<string, unknown>;
  actions: FinanceInsightAction[];
};
