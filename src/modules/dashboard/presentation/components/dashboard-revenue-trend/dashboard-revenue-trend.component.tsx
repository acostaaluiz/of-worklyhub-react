import { Empty, Skeleton } from "antd";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { LineChart } from "lucide-react";
import { formatMoney } from "@core/utils/mask";
import { i18n as appI18n } from "@core/i18n";

import type { DashboardSeriesPointModel } from "../../../interfaces/dashboard-series.model";
import {
  ChartWrap,
  WidgetCard,
  WidgetHeader,
  WidgetBody,
  TooltipCard,
} from "./dashboard-revenue-trend.component.styles";

type Props = {
  series: DashboardSeriesPointModel[];
  loading?: boolean;
};

type ChartTooltipProps<TPayload> = {
  active?: boolean;
  payload?: Array<{ payload?: TPayload }>;
  label?: string | number;
};

function CustomTooltip({
  active,
  payload,
  label,
}: ChartTooltipProps<DashboardSeriesPointModel>) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload as DashboardSeriesPointModel | undefined;
  if (!item) return null;

  return (
    <TooltipCard>
      <div className="label">{label}</div>
      <div className="row">
        <span>{appI18n.t("dashboard.revenueTrend.tooltip.revenue")}</span>
        <span className="value">{formatMoney(item.revenue)}</span>
      </div>
      <div className="row">
        <span>{appI18n.t("dashboard.revenueTrend.tooltip.profit")}</span>
        <span className="value">{formatMoney(item.profit)}</span>
      </div>
    </TooltipCard>
  );
}

export function DashboardRevenueTrend(props: Props) {
  const { series, loading } = props;
  const hasSeries = series.length > 0;
  const hasMeaningfulData = series.some(
    (point) => Math.abs(point.revenue) > 0 || Math.abs(point.profit) > 0
  );

  return (
    <WidgetCard className="surface">
      <WidgetHeader>
        <div>
          <div className="title">{appI18n.t("dashboard.revenueTrend.title")}</div>
          <div className="subtitle">{appI18n.t("dashboard.revenueTrend.subtitle")}</div>
        </div>
        <div className="header-icon" aria-hidden="true">
          <LineChart size={18} />
        </div>
      </WidgetHeader>

      <WidgetBody>
        {loading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : !hasSeries || !hasMeaningfulData ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={appI18n.t("dashboard.revenueTrend.empty")}
          />
        ) : (
          <ChartWrap>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={series}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--color-primary)"
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--color-primary)"
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                  <linearGradient id="profitFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--color-secondary)"
                      stopOpacity={0.25}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--color-secondary)"
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid stroke="var(--color-divider)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
                  axisLine={{ stroke: "var(--color-divider)" }}
                  tickLine={{ stroke: "var(--color-divider)" }}
                />
                <YAxis
                  tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
                  axisLine={{ stroke: "var(--color-divider)" }}
                  tickLine={{ stroke: "var(--color-divider)" }}
                  tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: "var(--color-tertiary)" }}
                />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-primary)"
                  strokeWidth={2.5}
                  fill="url(#revFill)"
                  activeDot={{
                    r: 5,
                    strokeWidth: 2,
                    stroke: "var(--color-primary)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="var(--color-secondary)"
                  strokeWidth={2}
                  fill="url(#profitFill)"
                  activeDot={{
                    r: 4,
                    strokeWidth: 2,
                    stroke: "var(--color-secondary)",
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartWrap>
        )}
      </WidgetBody>
    </WidgetCard>
  );
}
