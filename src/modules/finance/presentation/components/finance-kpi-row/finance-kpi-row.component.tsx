import { Skeleton } from "antd";
import { useCallback, useMemo } from "react";
import { formatMoneyCompact, formatNumberCompact } from "@core/utils/mask";
import { i18n as appI18n } from "@core/i18n";
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

const formatDelta = (delta: number | undefined, suffix: string) => {
  if (delta === undefined || !Number.isFinite(delta)) return null;
  const sign = delta >= 0 ? "+" : "";
  return `${sign}${(delta * 100).toFixed(1)}% ${suffix}`;
};

const kpiContextMap: Record<FinanceKpiModel["id"], FinanceValueContext> = {
  revenue: "income",
  expenses: "expense",
  profit: "neutral",
  margin: "neutral",
};

export function FinanceKpiRow({ kpis, loading }: Props) {
        const fallbackKpis: FinanceKpiModel[] = useMemo(
    () => [
      { id: "revenue", label: appI18n.t("legacyInline.finance.presentation_components_finance_kpi_row_finance_kpi_row_component.k001"), value: 0, format: "money" },
      { id: "expenses", label: appI18n.t("legacyInline.finance.presentation_components_finance_kpi_row_finance_kpi_row_component.k002"), value: 0, format: "money" },
      { id: "profit", label: appI18n.t("legacyInline.finance.presentation_components_finance_kpi_row_finance_kpi_row_component.k003"), value: 0, format: "money" },
      { id: "margin", label: appI18n.t("legacyInline.finance.presentation_components_finance_kpi_row_finance_kpi_row_component.k004"), value: 0, format: "percent" },
    ],
    []
  );

  const resolveKpiLabel = useCallback(
    (kpi: FinanceKpiModel) => {
      if (kpi.id === "revenue") return appI18n.t("legacyInline.finance.presentation_components_finance_kpi_row_finance_kpi_row_component.k005");
      if (kpi.id === "expenses") return appI18n.t("legacyInline.finance.presentation_components_finance_kpi_row_finance_kpi_row_component.k006");
      if (kpi.id === "profit") return appI18n.t("legacyInline.finance.presentation_components_finance_kpi_row_finance_kpi_row_component.k007");
      if (kpi.id === "margin") return appI18n.t("legacyInline.finance.presentation_components_finance_kpi_row_finance_kpi_row_component.k008");
      return kpi.label;
    },
    []
  );

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
                const deltaText = formatDelta(k.delta, appI18n.t("legacyInline.finance.presentation_components_finance_kpi_row_finance_kpi_row_component.k009"));
                const deltaColor =
                  deltaText == null
                    ? "var(--color-text-muted)"
                    : getFinanceValueColor(k.delta ?? 0, { context });

                return (
                  <>
                    <KpiMeta>
                      <div className="label">{resolveKpiLabel(k)}</div>
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
