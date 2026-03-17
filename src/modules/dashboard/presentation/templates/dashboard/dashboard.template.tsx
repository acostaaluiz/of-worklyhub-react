import { useCallback, useEffect, useMemo, useState } from "react";
import { Typography } from "antd";
import { BarChart3 } from "lucide-react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

import { BaseTemplate } from "@shared/base/base.template";

import {
  PageStack,
  TemplateTitleRow,
  TemplateTitleBlock,
  DashboardShell,
  DashboardGrid,
  GridSpan12,
  GridSpan4,
} from "./dashboard.template.styles";

import {
  DashboardService,
  type DashboardResponse,
} from "../../../services/dashboard.service";
import type { DashboardQueryModel } from "../../../interfaces/dashboard-query.model";

import {
  DashboardFilters,
  type DashboardView,
} from "../../components/dashboard-filters/dashboard-filters.component";
import { DashboardKpiRow } from "../../components/dashboard-kpi-row/dashboard-kpi-row.component";
import { DashboardRevenueTrend } from "../../components/dashboard-revenue-trend/dashboard-revenue-trend.component";
import { DashboardServiceBreakdown } from "../../components/dashboard-service-breakdown/dashboard-service-breakdown.component";
import { DashboardAlerts } from "../../components/dashboard-alerts/dashboard-alerts.component";

export function DashboardTemplate() {
  const { t } = useTranslation();
  const service = useMemo(() => new DashboardService(), []);

  const [view, setView] = useState<DashboardView>("overview");

  const [query, setQuery] = useState<DashboardQueryModel>(() => {
    const to = dayjs();
    const from = to.subtract(30, "day");
    return {
      from: from.format("YYYY-MM-DD"),
      to: to.format("YYYY-MM-DD"),
      groupBy: "day",
    };
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (q: DashboardQueryModel) => {
    setLoading(true);
    setError(null);
    try {
      const res = await service.getDashboard(q);
      setData(res);
    } catch (err) {
      setError(t("dashboard.template.messages.loadError"));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [service, t]);

  useEffect(() => {
    load(query);
  }, [query, load]);

  return (
    <BaseTemplate
      content={
        <>
          <PageStack>
            <TemplateTitleRow>
              <TemplateTitleBlock>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid color-mix(in srgb, var(--color-primary) 24%, var(--color-border))",
                      background: "color-mix(in srgb, var(--color-surface-2) 78%, transparent)",
                      boxShadow: "var(--shadow-sm)",
                      flexShrink: 0,
                    }}
                  >
                    <BarChart3 size={22} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Typography.Title level={2} style={{ margin: 0 }}>
                      {t("dashboard.template.header.title")}
                    </Typography.Title>
                    <Typography.Text type="secondary">
                      {t("dashboard.template.header.subtitle")}
                    </Typography.Text>
                  </div>
                </div>
              </TemplateTitleBlock>
            </TemplateTitleRow>

            <DashboardShell>
              <DashboardFilters
                value={query}
                onChange={setQuery}
                view={view}
                onViewChange={setView}
                loading={loading}
              />

              <DashboardKpiRow kpis={data?.kpis ?? []} loading={loading} />

              {error ? (
                <Typography.Text type="danger">{error}</Typography.Text>
              ) : null}

              {view === "overview" && (
                <DashboardGrid>
                  <GridSpan4>
                    <DashboardRevenueTrend
                      series={data?.revenueSeries ?? []}
                      loading={loading}
                    />
                  </GridSpan4>
                  <GridSpan4>
                    <DashboardServiceBreakdown
                      items={data?.serviceBreakdown ?? []}
                      loading={loading}
                    />
                  </GridSpan4>
                  <GridSpan4>
                    <DashboardAlerts items={data?.alerts ?? []} loading={loading} />
                  </GridSpan4>
                </DashboardGrid>
              )}

              {view === "trend" && (
                <DashboardGrid>
                  <GridSpan12>
                    <DashboardRevenueTrend
                      series={data?.revenueSeries ?? []}
                      loading={loading}
                    />
                  </GridSpan12>
                </DashboardGrid>
              )}

              {view === "services" && (
                <DashboardGrid>
                  <GridSpan12>
                    <DashboardServiceBreakdown
                      items={data?.serviceBreakdown ?? []}
                      loading={loading}
                    />
                  </GridSpan12>
                </DashboardGrid>
              )}

              {view === "alerts" && (
                <DashboardGrid>
                  <GridSpan12>
                    <DashboardAlerts items={data?.alerts ?? []} loading={loading} />
                  </GridSpan12>
                </DashboardGrid>
              )}
            </DashboardShell>
          </PageStack>
        </>
      }
    />
  );
}

export default DashboardTemplate;
