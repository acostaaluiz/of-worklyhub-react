import { Skeleton } from "antd";
import type { DashboardKpiModel } from "../../../interfaces/dashboard-kpi.model";
import {
  KpiGrid,
  KpiCard,
  KpiTop,
  KpiValue,
  KpiMeta,
  Span3,
} from "./dashboard-kpi-row.component.styles";

type Props = {
  kpis: DashboardKpiModel[];
  loading?: boolean;
};

const formatCompactMoney = (value: number) => {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    notation: "compact",
  } as any);
};

const formatCompactNumber = (value: number) => {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 0,
    notation: "compact",
  } as any);
};

export function DashboardKpiRow(props: Props) {
  const { kpis, loading } = props;

  const renderValue = (id: string, value: number) => {
    if (id === "orders") return formatCompactNumber(value);
    return formatCompactMoney(value);
  };

  return (
    <KpiGrid>
      {(kpis.length
        ? kpis
        : [
            { id: "revenue", label: "Gross revenue", value: 0 },
            { id: "profit", label: "Net profit", value: 0 },
            { id: "ticket", label: "Avg ticket", value: 0 },
            { id: "orders", label: "Services completed", value: 0 },
          ]
      ).map((kpi) => (
        <Span3 key={kpi.id}>
          <KpiCard className="surface">
            <KpiTop>
              <div className="label">{kpi.label}</div>
            </KpiTop>

            {loading ? (
              <Skeleton active paragraph={{ rows: 1 }} title={false} />
            ) : (
              <KpiValue>{renderValue(kpi.id, kpi.value)}</KpiValue>
            )}

            <KpiMeta>
              {typeof kpi.changePct === "number" ? (
                <span className="delta">
                  {kpi.changePct > 0
                    ? `+${kpi.changePct}%`
                    : `${kpi.changePct}%`}
                </span>
              ) : (
                <span className="delta">—</span>
              )}
              <span>vs previous period</span>
            </KpiMeta>
          </KpiCard>
        </Span3>
      ))}
    </KpiGrid>
  );
}
