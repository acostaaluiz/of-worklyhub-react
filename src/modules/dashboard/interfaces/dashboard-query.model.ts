export type DashboardGroupBy = "day" | "week" | "month";

export type DashboardQueryModel = {
  from: string;
  to: string;
  groupBy: DashboardGroupBy;
};
