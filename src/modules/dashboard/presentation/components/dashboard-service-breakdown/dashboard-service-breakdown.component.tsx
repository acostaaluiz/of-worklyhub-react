import { Skeleton } from "antd";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney } from "@core/utils/mask";

import type { DashboardServiceSalesModel } from "../../../interfaces/dashboard-service-sales.model";
import {
  ChartWrap,
  WidgetCard,
  WidgetHeader,
  WidgetBody,
} from "./dashboard-service-breakdown.component.styles";

type Props = {
  items: DashboardServiceSalesModel[];
  loading?: boolean;
};

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload as DashboardServiceSalesModel | undefined;
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
      <div style={{ fontWeight: 800, marginBottom: 6 }}>{item.serviceName}</div>
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
          Revenue
        </span>
        <span style={{ fontWeight: 800 }}>{formatMoney(item.revenue)}</span>
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
          Count
        </span>
        <span style={{ fontWeight: 800 }}>{item.count}</span>
      </div>
    </div>
  );
}

export function DashboardServiceBreakdown(props: Props) {
  const { items, loading } = props;

  return (
    <WidgetCard className="surface">
      <WidgetHeader>
        <div>
          <div className="title">Top services</div>
          <div className="subtitle">Revenue by service</div>
        </div>
      </WidgetHeader>

      <WidgetBody>
        {loading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : (
          <ChartWrap>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={items}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid stroke="var(--color-divider)" vertical={false} />
                <XAxis
                  dataKey="serviceName"
                  tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
                  axisLine={{ stroke: "var(--color-divider)" }}
                  tickLine={{ stroke: "var(--color-divider)" }}
                  interval={0}
                  height={48}
                />
                <YAxis
                  tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
                  axisLine={{ stroke: "var(--color-divider)" }}
                  tickLine={{ stroke: "var(--color-divider)" }}
                  tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "var(--color-glass-surface)" }}
                />
                <Bar
                  dataKey="revenue"
                  fill="var(--color-tertiary)"
                  radius={[10, 10, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartWrap>
        )}
      </WidgetBody>
    </WidgetCard>
  );
}
