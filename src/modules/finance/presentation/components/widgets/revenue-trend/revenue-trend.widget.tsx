import { Skeleton } from "antd";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { formatMoney } from "@core/utils/mask";
import { BarChart3 } from "lucide-react";

import type { FinanceSeries } from "../../../../interfaces/finance-series.model";
import {
  ChartWrap,
  TooltipCard,
  WidgetBody,
  WidgetCard,
  WidgetHeader,
} from "../finance-widgets.shared.styles";
import { getFinanceValueColor } from "../../../../utils/finance-value-status";

type Props = {
  className?: string;
  series: FinanceSeries;
  loading?: boolean;
  subtitle?: string;
  heightHint?: "default" | "full";
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const v = payload?.[0]?.value ?? 0;
  const color = getFinanceValueColor(v, { context: "income" });

  return (
    <TooltipCard>
      <div className="tTitle">{label}</div>
      <div className="tRow">
        <div className="k">Revenue</div>
        <div className="v" style={{ color }}>{formatMoney(v)}</div>
      </div>
    </TooltipCard>
  );
}

export function RevenueTrendWidget({
  className,
  series,
  loading,
  subtitle,
  heightHint = "default",
}: Props) {
  const data = series.points.map((p) => ({ label: p.label, value: p.value }));

  return (
    <WidgetCard className={className}>
      <WidgetHeader>
        <div className="titleRow">
          <div className="title">Revenue Trend</div>
          <div className="titleIcon">
            <BarChart3 size={16} />
          </div>
        </div>
        <div className="subtitle">{subtitle ?? "Revenue over time."}</div>
      </WidgetHeader>

      <WidgetBody>
        {loading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : (
          <ChartWrap
            style={{ height: heightHint === "full" ? "100%" : "100%" }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <XAxis dataKey="label" tickMargin={8} />
                <YAxis
                  width={56}
                  tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-primary)"
                  fill="var(--color-primary)"
                  fillOpacity={0.18}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartWrap>
        )}
      </WidgetBody>
    </WidgetCard>
  );
}
