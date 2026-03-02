export type DashboardKpiModel = {
  id: string;
  label: string;
  value: number;
  changePct?: number;
  format?: "money" | "number" | "percent";
};
