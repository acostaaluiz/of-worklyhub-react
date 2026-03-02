import { List, Skeleton, Tag, Typography } from "antd";
import { Siren } from "lucide-react";
import type { DashboardAlertModel } from "@modules/dashboard/interfaces/dashboard-alert.model";
import { WidgetBody, WidgetCard, WidgetHeader } from "./dashboard-alerts.component.styles";

type Props = {
  items: DashboardAlertModel[];
  loading?: boolean;
};

const sourceLabel: Record<DashboardAlertModel["source"], string> = {
  finance: "Finance",
  "work-order": "Work Order",
  schedule: "Schedule",
  people: "People",
};

const priorityColor: Record<DashboardAlertModel["priority"], string> = {
  high: "error",
  medium: "warning",
  low: "success",
};

export function DashboardAlerts(props: Props) {
  const { items, loading } = props;

  return (
    <WidgetCard className="surface">
      <WidgetHeader>
        <div>
          <div className="title">Operational alerts</div>
          <div className="subtitle">Prioritized insights for quick action</div>
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
            locale={{ emptyText: "No alerts for this period." }}
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
                    <div style={{ display: "flex", gap: 8 }}>
                      <Tag>{sourceLabel[item.source]}</Tag>
                      <Tag color={priorityColor[item.priority]}>{item.priority.toUpperCase()}</Tag>
                    </div>
                  </div>

                  <Typography.Paragraph style={{ marginBottom: 6 }}>
                    {item.description}
                  </Typography.Paragraph>
                  <Typography.Text type="secondary">
                    Action: {item.suggestedAction}
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
