import { Skeleton } from "antd";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatMoney } from "@core/utils/mask";
import { i18n as appI18n } from "@core/i18n";

import {
  ChartWrap,
  TooltipCard,
  WidgetBody,
  WidgetCard,
  WidgetHeader,
} from "../finance-widgets.shared.styles";
import { getFinanceValueColor } from "../../../../utils/finance-value-status";

type Item = { id: string; category: string; value: number };

type Props = {
  className?: string;
  items: Item[];
  loading?: boolean;
  subtitle?: string;
};

type PieTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload?: Item }>;
};

const palette = [
  "var(--color-primary)",
  "var(--color-secondary)",
  "var(--color-tertiary)",
  "var(--color-warning)",
  "var(--color-info)",
];

function CustomTooltip({ active, payload }: PieTooltipProps) {
        if (!active || !payload?.length) return null;
  const p = payload[0]?.payload as Item | undefined;
  if (!p) return null;
  const color = getFinanceValueColor(p.value, { context: "expense" });

  return (
    <TooltipCard>
      <div className="tTitle">{p.category}</div>
      <div className="tRow">
        <div className="k">{appI18n.t("legacyInline.finance.presentation_components_widgets_expenses_breakdown_expenses_breakdown_widget.k001")}</div>
        <div className="v" style={{ color }}>{formatMoney(p.value)}</div>
      </div>
    </TooltipCard>
  );
}

export function ExpensesBreakdownWidget({
  className,
  items,
  loading,
  subtitle,
}: Props) {
        const data = items ?? [];

  return (
    <WidgetCard className={className}>
      <WidgetHeader>
        <div className="title">{appI18n.t("legacyInline.finance.presentation_components_widgets_expenses_breakdown_expenses_breakdown_widget.k002")}</div>
        <div className="subtitle">{subtitle ?? appI18n.t("legacyInline.finance.presentation_components_widgets_expenses_breakdown_expenses_breakdown_widget.k003")}</div>
      </WidgetHeader>

      <WidgetBody>
        {loading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : (
          <ChartWrap>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="category"
                  innerRadius="58%"
                  outerRadius="86%"
                  stroke="var(--color-border)"
                >
                  {data.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={palette[idx % palette.length]}
                      opacity={0.85}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartWrap>
        )}
      </WidgetBody>
    </WidgetCard>
  );
}
