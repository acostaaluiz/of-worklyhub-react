import { Skeleton } from "antd";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

const formatMoney = (value: number) =>
  value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload as DashboardSeriesPointModel | undefined;
  if (!item) return null;

  return (
    <TooltipCard>
      <div className="label">{label}</div>
      <div className="row">
        <span>Revenue</span>
        <span className="value">{formatMoney(item.revenue)}</span>
      </div>
      <div className="row">
        <span>Profit</span>
        <span className="value">{formatMoney(item.profit)}</span>
      </div>
    </TooltipCard>
  );
}

export function DashboardRevenueTrend(props: Props) {
  const { series, loading } = props;

  return (
    <WidgetCard>
      <WidgetHeader>
        <div>
          <div className="title">Revenue trend</div>
          <div className="subtitle">Revenue and profit over time</div>
        </div>
      </WidgetHeader>

      <WidgetBody>
        {loading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
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
