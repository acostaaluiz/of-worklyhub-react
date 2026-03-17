import { Skeleton } from "antd";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { formatMoneyCompact, formatNumberCompact } from "@core/utils/mask";
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

function translateKpiLabel(kpi: DashboardKpiModel, t: (key: string) => string): string {
  const byId: Record<string, string> = {
    appointments: t("dashboard.kpis.labels.appointments"),
    "work-orders-open": t("dashboard.kpis.labels.workOrdersOpen"),
    "active-workers": t("dashboard.kpis.labels.activeWorkers"),
    "completion-rate": t("dashboard.kpis.labels.completionRate"),
    revenue: t("dashboard.kpis.labels.revenue"),
    profit: t("dashboard.kpis.labels.profit"),
    orders: t("dashboard.kpis.labels.orders"),
  };
  return byId[kpi.id] ?? kpi.label;
}

function renderValue(kpi: DashboardKpiModel): string {
  if (kpi.format === "number") return formatNumberCompact(kpi.value);
  if (kpi.format === "percent") return `${kpi.value.toFixed(1)}%`;
  if (kpi.id === "orders") return formatNumberCompact(kpi.value);
  return formatMoneyCompact(kpi.value, { precision: 0 });
}

function renderIcon(kpiId: string): ReactNode {
  switch (kpiId) {
    case "revenue":
      return <DollarSign size={16} />;
    case "profit":
      return <WalletCards size={16} />;
    case "appointments":
      return <CalendarClock size={16} />;
    case "work-orders-open":
      return <ClipboardList size={16} />;
    case "active-workers":
      return <UsersRound size={16} />;
    case "completion-rate":
      return <CheckCircle2 size={16} />;
    default:
      return <DollarSign size={16} />;
  }
}

export function DashboardKpiRow(props: Props) {
  const { t } = useTranslation();
  const { kpis, loading } = props;

  return (
    <KpiGrid>
      {(kpis.length
        ? kpis
        : [
            { id: "appointments", label: t("dashboard.kpis.labels.appointments"), value: 0, format: "number" as const },
            { id: "work-orders-open", label: t("dashboard.kpis.labels.workOrdersOpen"), value: 0, format: "number" as const },
            { id: "active-workers", label: t("dashboard.kpis.labels.activeWorkers"), value: 0, format: "number" as const },
            { id: "completion-rate", label: t("dashboard.kpis.labels.completionRate"), value: 0, format: "percent" as const },
          ]
      ).map((kpi) => (
        <Span3 key={kpi.id}>
          <KpiCard className="surface">
            <KpiTop>
              <div className="label">{translateKpiLabel(kpi, t)}</div>
              <div className="icon">{renderIcon(kpi.id)}</div>
            </KpiTop>

            {loading ? (
              <Skeleton active paragraph={{ rows: 1 }} title={false} />
            ) : (
              <KpiValue>{renderValue(kpi)}</KpiValue>
            )}

            <KpiMeta>
              {typeof kpi.changePct === "number" ? (
                <span className="delta">
                  {kpi.changePct > 0 ? `+${kpi.changePct}%` : `${kpi.changePct}%`}
                </span>
              ) : (
                <span className="delta">-</span>
              )}
              <span>{t("dashboard.kpis.meta.vsPreviousPeriod")}</span>
            </KpiMeta>
          </KpiCard>
        </Span3>
      ))}
    </KpiGrid>
  );
}
