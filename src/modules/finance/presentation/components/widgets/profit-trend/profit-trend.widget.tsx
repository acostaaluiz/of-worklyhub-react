import { Skeleton } from "antd";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { formatMoney } from "@core/utils/mask";

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
  revenue: FinanceSeries;
  expenses: FinanceSeries;
  profit: FinanceSeries;
  loading?: boolean;
  subtitle?: string;
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  const get = (k: string) =>
    payload.find((p: any) => p.dataKey === k)?.value ?? 0;
  const revenue = get("revenue");
  const expenses = get("expenses");
  const profit = get("profit");

  return (
    <TooltipCard>
      <div className="tTitle">{label}</div>
      <div className="tRow">
        <div className="k">Revenue</div>
        <div className="v" style={{ color: getFinanceValueColor(revenue, { context: "income" }) }}>
          {formatMoney(revenue)}
        </div>
      </div>
      <div className="tRow">
        <div className="k">Expenses</div>
        <div className="v" style={{ color: getFinanceValueColor(expenses, { context: "expense" }) }}>
          {formatMoney(expenses)}
        </div>
      </div>
      <div className="tRow">
        <div className="k">Profit</div>
        <div className="v" style={{ color: getFinanceValueColor(profit, { context: "neutral" }) }}>
          {formatMoney(profit)}
        </div>
      </div>
    </TooltipCard>
  );
}

export function ProfitTrendWidget({
  className,
  revenue,
  expenses,
  profit,
  loading,
  subtitle,
}: Props) {
  const data = revenue.points.map((p, idx) => ({
    label: p.label,
    revenue: p.value,
    expenses: expenses.points[idx]?.value ?? 0,
    profit: profit.points[idx]?.value ?? 0,
  }));

  return (
    <WidgetCard className={className}>
      <WidgetHeader>
        <div className="title">Profit Trend</div>
        <div className="subtitle">
          {subtitle ?? "Profit computed from revenue minus expenses."}
        </div>
      </WidgetHeader>

      <WidgetBody>
        {loading ? (
          <Skeleton active paragraph={{ rows: 7 }} />
        ) : (
          <ChartWrap>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <XAxis dataKey="label" tickMargin={8} />
                <YAxis
                  width={56}
                  tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-primary)"
                  dot={false}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="var(--color-warning)"
                  dot={false}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="var(--color-secondary)"
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartWrap>
        )}
      </WidgetBody>
    </WidgetCard>
  );
}
