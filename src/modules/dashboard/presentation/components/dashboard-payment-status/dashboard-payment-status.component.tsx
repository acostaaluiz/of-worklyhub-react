import { Skeleton } from "antd";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatMoney } from "@core/utils/mask";
import { i18n as appI18n } from "@core/i18n";

import type { DashboardPaymentStatusModel } from "../../../interfaces/dashboard-payment-status.model";
import {
  WidgetCard,
  WidgetHeader,
  WidgetBody,
  StatusLegend,
} from "./dashboard-payment-status.component.styles";

type Props = {
  items: DashboardPaymentStatusModel[];
  loading?: boolean;
};

const statusColor: Record<string, string> = {
  paid: "var(--color-secondary)",
  pending: "var(--color-tertiary)",
  refunded: "var(--color-text-muted)",
};

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    paid: appI18n.t("dashboard.common.statuses.paid"),
    pending: appI18n.t("dashboard.common.statuses.pending"),
    refunded: appI18n.t("dashboard.common.statuses.refunded"),
  };
  return labels[status] ?? status;
}

type ChartTooltipProps<TPayload> = {
  active?: boolean;
  payload?: Array<{ payload?: TPayload }>;
};

function CustomTooltip({ active, payload }: ChartTooltipProps<DashboardPaymentStatusModel>) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload as DashboardPaymentStatusModel | undefined;
  if (!item) return null;

  return (
    <div
      style={{
        background: "var(--color-surface-elevated)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-md)",
        padding: "var(--space-3)",
        minWidth: 220,
      }}
    >
      <div style={{ fontWeight: 800, marginBottom: 6 }}>
        {statusLabel(item.status)}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "var(--space-3)",
        }}
      >
        <span
          style={{
            color: "var(--color-text-muted)",
            fontSize: "var(--font-size-sm)",
          }}
        >
          {appI18n.t("dashboard.paymentStatus.tooltip.amount")}
        </span>
        <span style={{ fontWeight: 800 }}>{formatMoney(item.amount)}</span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "var(--space-3)",
        }}
      >
        <span
          style={{
            color: "var(--color-text-muted)",
            fontSize: "var(--font-size-sm)",
          }}
        >
          {appI18n.t("dashboard.paymentStatus.tooltip.count")}
        </span>
        <span style={{ fontWeight: 800 }}>{item.count}</span>
      </div>
    </div>
  );
}

export function DashboardPaymentStatus(props: Props) {
  const { items, loading } = props;

  const total = items.reduce((acc, i) => acc + i.amount, 0);

  return (
    <WidgetCard className="surface">
      <WidgetHeader>
        <div>
          <div className="title">{appI18n.t("dashboard.paymentStatus.title")}</div>
          <div className="subtitle">{appI18n.t("dashboard.paymentStatus.subtitle")}</div>
        </div>
      </WidgetHeader>

      <WidgetBody>
        {loading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : (
          <>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie
                    data={items}
                    dataKey="amount"
                    nameKey="status"
                    innerRadius={62}
                    outerRadius={88}
                    paddingAngle={3}
                    stroke="var(--color-surface)"
                    strokeWidth={2}
                  >
                    {items.map((entry) => (
                      <Cell
                        key={entry.status}
                        fill={
                          statusColor[entry.status] ?? "var(--color-primary)"
                        }
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <div style={{ fontWeight: 900, letterSpacing: "-0.01em" }}>
                {appI18n.t("dashboard.paymentStatus.total")}
              </div>
              <div style={{ fontWeight: 900, fontSize: 18 }}>
                {formatMoney(total)}
              </div>
            </div>

            <StatusLegend>
              {items.map((i) => (
                <div key={i.status} className="row">
                  <div className="left">
                    <span
                      className="dot"
                      style={{
                        background:
                          statusColor[i.status] ?? "var(--color-primary)",
                      }}
                    />
                    <span>{statusLabel(i.status)}</span>
                  </div>
                  <span className="value">{formatMoney(i.amount)}</span>
                </div>
              ))}
            </StatusLegend>
          </>
        )}
      </WidgetBody>
    </WidgetCard>
  );
}
