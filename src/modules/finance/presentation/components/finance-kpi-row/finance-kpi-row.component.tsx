import { Skeleton } from "antd";
import type { FinanceKpiModel } from "../../../interfaces/finance-kpi.model";
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

const formatCompactMoney = (value: number) => {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  });
};

const formatCompactNumber = (value: number) => {
  return value.toLocaleString("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  });
};

const formatPercent = (value: number) => {
  return `${(value * 100).toFixed(1)}%`;
};

const formatKpiValue = (kpi: FinanceKpiModel) => {
  if (kpi.format === "money") return formatCompactMoney(kpi.value);
  if (kpi.format === "percent") return formatPercent(kpi.value);
  return formatCompactNumber(kpi.value);
};

const formatDelta = (delta?: number) => {
  if (delta === undefined) return null;
  const sign = delta >= 0 ? "+" : "";
  return `${sign}${(delta * 100).toFixed(1)}% vs prev.`;
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
              <KpiMeta>
                <div className="label">{k.label}</div>
                <div className="delta">{formatDelta(k.delta) ?? "\u00A0"}</div>
              </KpiMeta>
              <KpiValue>{formatKpiValue(k)}</KpiValue>
            </KpiTop>
          )}
        </KpiCard>
      ))}
    </KpiGrid>
  );
}
