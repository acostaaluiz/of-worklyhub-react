export type DashboardAlertPriority = "high" | "medium" | "low";
export type DashboardAlertSource = "finance" | "work-order" | "schedule" | "people";

export type DashboardAlertModel = {
  id: string;
  source: DashboardAlertSource;
  priority: DashboardAlertPriority;
  title: string;
  description: string;
  suggestedAction: string;
};

