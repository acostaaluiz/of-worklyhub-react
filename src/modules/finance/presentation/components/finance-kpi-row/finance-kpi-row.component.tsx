import { Skeleton } from "antd";
import { formatMoneyCompact, formatNumberCompact } from "@core/utils/mask";
import type { FinanceKpiModel } from "../../../interfaces/finance-kpi.model";
import {
  type FinanceValueContext,
  getFinanceValueColor,
} from "../../../utils/finance-value-status";
import {
  KpiCard,
  KpiGrid,
  KpiMeta,
  KpiTop,
  KpiValue,
} from "./finance-kpi-row.component.styles";

type Props = {
  kpis: FinanceKpiModel[];
  loading?: boolean;
};

const formatPercent = (value: number) => {
  return `${(value * 100).toFixed(1)}%`;
};

const formatKpiValue = (kpi: FinanceKpiModel) => {
  if (kpi.format === "money") return formatMoneyCompact(kpi.value, { precision: 1 });
  if (kpi.format === "percent") return formatPercent(kpi.value);
  return formatNumberCompact(kpi.value);
};

const formatDelta = (delta?: number) => {
  if (delta === undefined || !Number.isFinite(delta)) return null;
  const sign = delta >= 0 ? "+" : "";
  return `${sign}${(delta * 100).toFixed(1)}% vs prev.`;
};

const kpiContextMap: Record<FinanceKpiModel["id"], FinanceValueContext> = {
  revenue: "income",
  expenses: "expense",
  profit: "neutral",
  margin: "neutral",
};

const fallbackKpis: FinanceKpiModel[] = [
  { id: "revenue", label: "Revenue", value: 0, format: "money" },
  { id: "expenses", label: "Expenses", value: 0, format: "money" },
  { id: "profit", label: "Profit", value: 0, format: "money" },
  { id: "margin", label: "Margin", value: 0, format: "percent" },
];

export function FinanceKpiRow({ kpis, loading }: Props) {
  const items = (kpis?.length ? kpis : fallbackKpis).slice(0, 4);

  return (
    <KpiGrid>
      {items.map((k) => (
        <KpiCard key={k.id} className="surface">
          {loading ? (
            <Skeleton active paragraph={{ rows: 1 }} />
          ) : (
            <KpiTop>
              {(() => {
                const context = kpiContextMap[k.id] ?? "neutral";
                const valueColor = getFinanceValueColor(k.value, { context });
                const deltaText = formatDelta(k.delta);
                const deltaColor =
                  deltaText == null
                    ? "var(--color-text-muted)"
                    : getFinanceValueColor(k.delta ?? 0, { context });

                return (
                  <>
                    <KpiMeta>
                      <div className="label">{k.label}</div>
                      <div className="delta" style={{ color: deltaColor }}>
                        {deltaText ?? "\u00A0"}
                      </div>
                    </KpiMeta>
                    <KpiValue style={{ color: valueColor }}>
                      {formatKpiValue(k)}
                    </KpiValue>
                  </>
                );
              })()}
            </KpiTop>
          )}
        </KpiCard>
      ))}
    </KpiGrid>
  );
}
