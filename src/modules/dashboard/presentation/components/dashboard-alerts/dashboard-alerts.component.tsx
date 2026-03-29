import { List, Skeleton, Tag, Typography } from "antd";
import { Siren } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { DashboardAlertModel } from "@modules/dashboard/interfaces/dashboard-alert.model";
import { WidgetBody, WidgetCard, WidgetHeader } from "./dashboard-alerts.component.styles";

type Props = {
  items: DashboardAlertModel[];
  loading?: boolean;
};

const priorityColor: Record<DashboardAlertModel["priority"], string> = {
  high: "error",
  medium: "warning",
  low: "success",
};

export function DashboardAlerts(props: Props) {
  const { t } = useTranslation();
  const { items, loading } = props;

  const sourceLabel: Record<DashboardAlertModel["source"], string> = {
    finance: t("dashboard.alerts.sources.finance"),
    "work-order": t("dashboard.alerts.sources.workOrder"),
    schedule: t("dashboard.alerts.sources.schedule"),
    people: t("dashboard.alerts.sources.people"),
  };

  const priorityLabel: Record<DashboardAlertModel["priority"], string> = {
    high: t("dashboard.alerts.priorities.high"),
    medium: t("dashboard.alerts.priorities.medium"),
    low: t("dashboard.alerts.priorities.low"),
  };

  return (
    <WidgetCard className="surface">
      <WidgetHeader>
        <div>
          <div className="title">{t("dashboard.alerts.title")}</div>
          <div className="subtitle">{t("dashboard.alerts.subtitle")}</div>
        </div>
        <div className="header-icon" aria-hidden="true">
          <Siren size={18} />
        </div>
      </WidgetHeader>

      {loading ? (
        <Skeleton active paragraph={{ rows: 8 }} style={{ padding: "var(--space-4) var(--space-5)" }} />
      ) : (
        <WidgetBody>
          <List
            dataSource={items}
            locale={{ emptyText: t("dashboard.alerts.empty") }}
            style={{ padding: "var(--space-2) var(--space-4) var(--space-4)" }}
            renderItem={(item) => (
              <List.Item style={{ alignItems: "flex-start" }}>
                <div style={{ width: "100%" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "var(--space-2)",
                      flexWrap: "wrap",
                      marginBottom: 6,
                    }}
                  >
                    <Typography.Text strong>{item.title}</Typography.Text>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Tag>{sourceLabel[item.source]}</Tag>
                      <Tag color={priorityColor[item.priority]}>{priorityLabel[item.priority]}</Tag>
                      {item.engineUsed ? <Tag>{t("dashboard.alerts.tags.engine", { engine: item.engineUsed.toUpperCase() })}</Tag> : null}
                      {typeof item.confidence === "number" ? (
                        <Tag>{t("dashboard.alerts.tags.confidence", { confidence: (item.confidence * 100).toFixed(0) })}</Tag>
                      ) : null}
                    </div>
                  </div>

                  <Typography.Paragraph style={{ marginBottom: 6 }}>
                    {item.description}
                  </Typography.Paragraph>
                  {item.rationale ? (
                    <Typography.Text type="secondary" style={{ display: "block", marginBottom: 6 }}>
                      {t("dashboard.alerts.labels.why")}: {item.rationale}
                    </Typography.Text>
                  ) : null}
                  <Typography.Text type="secondary">
                    {t("dashboard.alerts.labels.action")}: {item.suggestedAction}
                  </Typography.Text>
                </div>
              </List.Item>
            )}
          />
        </WidgetBody>
      )}
    </WidgetCard>
  );
}

export default DashboardAlerts;
