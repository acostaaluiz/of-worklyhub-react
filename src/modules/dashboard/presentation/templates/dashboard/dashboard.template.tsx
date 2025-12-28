import { useEffect, useMemo, useState } from "react";
import { Typography } from "antd";
import dayjs from "dayjs";

import { BaseTemplate } from "@shared/base/base.template";
import { PrivateFrameLayout } from "@shared/ui/layout/private-frame/private-frame.component";

import {
  PageStack,
  TemplateTitleRow,
  TemplateTitleBlock,
  DashboardShell,
  DashboardGrid,
  GridSpan12,
  GridSpan6,
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
import { DashboardPaymentStatus } from "../../components/dashboard-payment-status/dashboard-payment-status.component";
import { DashboardTopClients } from "../../components/dashboard-top-clients/dashboard-top-clients.component";
import { DashboardRecentSales } from "../../components/dashboard-recent-sales/dashboard-recent-sales.component";

export function DashboardTemplate() {
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

  const load = async (q: DashboardQueryModel) => {
    setLoading(true);
    const res = await service.getDashboard(q);
    setData(res);
    setLoading(false);
  };

  useEffect(() => {
    load(query);
  }, [query, service]);

  return (
    <BaseTemplate
      content={
        <PrivateFrameLayout>
          <PageStack>
            <TemplateTitleRow>
              <TemplateTitleBlock>
                <Typography.Title level={2} style={{ margin: 0 }}>
                  Dashboard
                </Typography.Title>
                <Typography.Text type="secondary">
                  Financial overview of your company performance.
                </Typography.Text>
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

              {view === "overview" && (
                <DashboardGrid>
                  <GridSpan4>
                    <DashboardRevenueTrend
                      series={data?.revenueSeries ?? []}
                      loading={loading}
                    />
                  </GridSpan4>
                  <GridSpan4>
                    <DashboardPaymentStatus
                      items={data?.paymentStatus ?? []}
                      loading={loading}
                    />
                  </GridSpan4>
                  <GridSpan4>
                    <DashboardServiceBreakdown
                      items={data?.serviceBreakdown ?? []}
                      loading={loading}
                    />
                  </GridSpan4>
                </DashboardGrid>
              )}

              {view === "revenue" && (
                <DashboardGrid>
                  <GridSpan12>
                    <DashboardRevenueTrend
                      series={data?.revenueSeries ?? []}
                      loading={loading}
                    />
                  </GridSpan12>
                  <GridSpan6>
                    <DashboardPaymentStatus
                      items={data?.paymentStatus ?? []}
                      loading={loading}
                    />
                  </GridSpan6>
                  <GridSpan6>
                    <DashboardRecentSales
                      items={data?.recentSales ?? []}
                      loading={loading}
                    />
                  </GridSpan6>
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

              {view === "clients" && (
                <DashboardGrid>
                  <GridSpan12>
                    <DashboardTopClients
                      items={data?.topClients ?? []}
                      loading={loading}
                    />
                  </GridSpan12>
                </DashboardGrid>
              )}

              {view === "sales" && (
                <DashboardGrid>
                  <GridSpan12>
                    <DashboardRecentSales
                      items={data?.recentSales ?? []}
                      loading={loading}
                    />
                  </GridSpan12>
                </DashboardGrid>
              )}
            </DashboardShell>
          </PageStack>
        </PrivateFrameLayout>
      }
    />
  );
}

export default DashboardTemplate;
