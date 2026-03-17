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
import { i18n as appI18n } from "@core/i18n";

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

type RevenueTooltipProps = {
  active?: boolean;
  payload?: Array<{ value?: string | number }>;
  label?: string | number;
};

function CustomTooltip({ active, payload, label }: RevenueTooltipProps) {
        if (!active || !payload?.length) return null;
  const numeric = Number(payload[0]?.value ?? 0);
  const v = Number.isFinite(numeric) ? numeric : 0;
  const color = getFinanceValueColor(v, { context: "income" });
  const tooltipLabel =
    typeof label === "string" || typeof label === "number" ? String(label) : "";

  return (
    <TooltipCard>
      <div className="tTitle">{tooltipLabel}</div>
      <div className="tRow">
        <div className="k">{appI18n.t("legacyInline.finance.presentation_components_widgets_revenue_trend_revenue_trend_widget.k001")}</div>
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
          <div className="title">{appI18n.t("legacyInline.finance.presentation_components_widgets_revenue_trend_revenue_trend_widget.k002")}</div>
          <div className="titleIcon">
            <BarChart3 size={16} />
          </div>
        </div>
        <div className="subtitle">{subtitle ?? appI18n.t("legacyInline.finance.presentation_components_widgets_revenue_trend_revenue_trend_widget.k003")}</div>
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
