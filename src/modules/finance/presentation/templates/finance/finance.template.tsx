import { Typography } from "antd";
import { BarChart3 } from "lucide-react";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { i18n as appI18n } from "@core/i18n";

import {
  FinanceTemplateShell,
  PageStack,
  TemplateTitleRow,
  TemplateTitleBlock,
  FiltersCard,
  DashboardShell,
  DashboardGrid,
  GridSpan12,
  GridSpan8,
  GridSpan4,
} from "./finance.template.styles";
import { FinanceFilters } from "../../components/finance-filters/finance-filters.component";
import { FinanceKpiRow } from "../../components/finance-kpi-row/finance-kpi-row.component";
import { CashflowTableWidget } from "../../components/widgets/cashflow-table/cashflow-table.widget";
import { RevenueTrendWidget } from "../../components/widgets/revenue-trend/revenue-trend.widget";
import { TopServicesTableWidget } from "../../components/widgets/top-services-table/top-services-table.widget";
import { ActionableInsightsWidget } from "../../components/widgets/actionable-insights/actionable-insights.widget";

import { FinanceService } from "@modules/finance/services/finance.service";
import type { FinanceQueryModel, FinanceView } from "@modules/finance/interfaces/finance-query.model";
import type { FinanceResponseModel } from "@modules/finance/interfaces/finance-response.model";
import type { FinanceGroupBy } from "@modules/finance/interfaces/finance-groupby.model";

const AVAILABLE_VIEWS: FinanceView[] = [
  "overview",
  "insights",
  "revenue",
  "top-services",
  "cashflow",
];

const OVERVIEW_PANEL_HEIGHT = "clamp(260px, calc(100dvh - 560px), 360px)";

const defaultQuery = (): FinanceQueryModel => {
  const from = dayjs().subtract(30, "day").format("YYYY-MM-DD");
  const to = dayjs().format("YYYY-MM-DD");
  return {
    from,
    to,
    groupBy: "day",
    view: "overview",
  };
};

const emptyResponse = (): FinanceResponseModel => ({
  kpis: [],
  revenueSeries: { key: "revenue", points: [] },
  expensesSeries: { key: "expenses", points: [] },
  profitSeries: { key: "profit", points: [] },
  expensesByCategory: [],
  cashflow: [],
  topServices: [],
  insights: [],
});

export function FinanceTemplate() {
        const service = useMemo(() => new FinanceService(), []);
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedView = searchParams.get("view") as FinanceView | null;
  const initialView: FinanceView =
    requestedView && AVAILABLE_VIEWS.includes(requestedView)
      ? requestedView
      : "overview";

  const [query, setQuery] = useState<FinanceQueryModel>(() => ({
    ...defaultQuery(),
    view: initialView,
  }));
  const [view, setView] = useState<FinanceView>(initialView);
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<FinanceResponseModel>(() => emptyResponse());

  // view é estado de template, mas fica "espelhado" no query para facilitar fetch por view se desejar
  useEffect(() => {
    setQuery((prev) => ({ ...prev, view }));
  }, [view]);

  useEffect(() => {
    const rawView = searchParams.get("view") as FinanceView | null;
    if (!rawView) {
      if (view !== "overview") setView("overview");
      return;
    }
    if (!AVAILABLE_VIEWS.includes(rawView)) return;
    if (rawView !== view) setView(rawView);
  }, [searchParams, view]);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      try {
        const resp = await service.getFinance(query);
        if (!alive) return;
        setData(resp);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [service, query]);

  const handleChangeQuery = (next: Partial<FinanceQueryModel>) => {
    setQuery((prev) => ({ ...prev, ...next }));
  };

  const handleRefresh = () => {
    setQuery((prev) => ({ ...prev }));
  };

  const handleChangeGroupBy = (groupBy: FinanceGroupBy) => {
    handleChangeQuery({ groupBy });
  };

  const handleChangePeriod = (from: string, to: string) => {
    handleChangeQuery({ from, to });
  };

  const handleChangeView = (nextView: FinanceView) => {
    if (nextView === view) return;

    setView(nextView);

    const next = new URLSearchParams(searchParams);
    if (nextView === "overview") next.delete("view");
    else next.set("view", nextView);

    setSearchParams(next, { replace: true });
  };

  return (
    <FinanceTemplateShell
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
                  <div>
                    <Typography.Title level={2} style={{ margin: 0 }}>
                      {appI18n.t("legacyInline.finance.presentation_templates_finance_finance_template.k001")}
                    </Typography.Title>
                    <Typography.Text type="secondary">
                      {appI18n.t("legacyInline.finance.presentation_templates_finance_finance_template.k002")}
                    </Typography.Text>
                  </div>
                </div>
              </TemplateTitleBlock>
            </TemplateTitleRow>

            <FiltersCard>
              <FinanceFilters
                from={query.from}
                to={query.to}
                view={view}
                groupBy={query.groupBy}
                loading={loading}
                availableViews={AVAILABLE_VIEWS}
                onChangePeriod={handleChangePeriod}
                onChangeView={handleChangeView}
                onChangeGroupBy={handleChangeGroupBy}
                onRefresh={handleRefresh}
              />
            </FiltersCard>

            <FinanceKpiRow kpis={data.kpis} loading={loading} />

            <DashboardShell>
              {/* A grid sempre existe, mas widgets variam por view */}
              <DashboardGrid>
                {view === "overview" && (
                  <>
                    <GridSpan8 style={{ height: OVERVIEW_PANEL_HEIGHT }}>
                      <RevenueTrendWidget
                        className="surface"
                        series={data.revenueSeries}
                        loading={loading}
                        subtitle={appI18n.t("legacyInline.finance.presentation_templates_finance_finance_template.k003")}
                      />
                    </GridSpan8>
                    <GridSpan4 style={{ height: OVERVIEW_PANEL_HEIGHT }}>
                      <ActionableInsightsWidget
                        className="surface"
                        items={data.insights}
                        loading={loading}
                        subtitle={appI18n.t("legacyInline.finance.presentation_templates_finance_finance_template.k004")}
                      />
                    </GridSpan4>
                  </>
                )}

                {view === "revenue" && (
                  <>
                    <GridSpan12>
                      <RevenueTrendWidget
                        className="surface"
                        series={data.revenueSeries}
                        loading={loading}
                        subtitle={appI18n.t("legacyInline.finance.presentation_templates_finance_finance_template.k005")}
                        heightHint="full"
                      />
                    </GridSpan12>
                  </>
                )}

                {view === "top-services" && (
                  <>
                    <GridSpan12>
                      <TopServicesTableWidget
                        className="surface"
                        items={data.topServices}
                        loading={loading}
                        subtitle={appI18n.t("legacyInline.finance.presentation_templates_finance_finance_template.k006")}
                      />
                    </GridSpan12>
                  </>
                )}

                {view === "cashflow" && (
                  <>
                    <GridSpan12>
                      <CashflowTableWidget
                        className="surface"
                        items={data.cashflow}
                        loading={loading}
                        subtitle={appI18n.t("legacyInline.finance.presentation_templates_finance_finance_template.k007")}
                        dense={false}
                      />
                    </GridSpan12>
                  </>
                )}

                {view === "insights" && (
                  <>
                    <GridSpan12 style={{ height: "100%" }}>
                      <ActionableInsightsWidget
                        className="surface"
                        items={data.insights}
                        loading={loading}
                        subtitle={appI18n.t("legacyInline.finance.presentation_templates_finance_finance_template.k008")}
                      />
                    </GridSpan12>
                  </>
                )}
              </DashboardGrid>
            </DashboardShell>
          </PageStack>
        </>
      }
    />
  );
}
