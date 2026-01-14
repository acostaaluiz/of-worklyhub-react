import { Typography } from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";

import { BaseTemplate } from "@shared/base/base.template";

import {
  PageStack,
  TemplateTitleRow,
  TemplateTitleBlock,
  FiltersCard,
  DashboardShell,
  DashboardGrid,
  GridSpan12,
  GridSpan6,
  GridSpan4,
  GridSpan8,
} from "./finance.template.styles";
import { FinanceFilters } from "../../components/finance-filters/finance-filters.component";
import { FinanceKpiRow } from "../../components/finance-kpi-row/finance-kpi-row.component";
import { CashflowTableWidget } from "../../components/widgets/cashflow-table/cashflow-table.widget";
import { ExpensesBreakdownWidget } from "../../components/widgets/expenses-breakdown/expenses-breakdown.widget";
import { ProfitTrendWidget } from "../../components/widgets/profit-trend/profit-trend.widget";
import { RevenueTrendWidget } from "../../components/widgets/revenue-trend/revenue-trend.widget";
import { TopServicesTableWidget } from "../../components/widgets/top-services-table/top-services-table.widget";

import { FinanceService } from "@modules/finance/services/finance.service";
import type { FinanceQueryModel, FinanceView } from "@modules/finance/interfaces/finance-query.model";
import type { FinanceResponseModel } from "@modules/finance/interfaces/finance-response.model";
import type { FinanceGroupBy } from "@modules/finance/interfaces/finance-groupby.model";

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
});

export function FinanceTemplate() {
  const service = useMemo(() => new FinanceService(), []);

  const [query, setQuery] = useState<FinanceQueryModel>(() => defaultQuery());
  const [view, setView] = useState<FinanceView>("overview");
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<FinanceResponseModel>(() => emptyResponse());

  // view é estado de template, mas fica "espelhado" no query para facilitar fetch por view se desejar
  useEffect(() => {
    setQuery((prev) => ({ ...prev, view }));
  }, [view]);

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
    setQuery((prev: any) => ({ ...prev, ...next }));
  };

  const handleRefresh = () => {
    setQuery((prev: any) => ({ ...prev }));
  };

  const handleChangeGroupBy = (groupBy: FinanceGroupBy) => {
    handleChangeQuery({ groupBy });
  };

  const handleChangePeriod = (from: string, to: string) => {
    handleChangeQuery({ from, to });
  };

  return (
    <BaseTemplate
      content={
        <>
          <PageStack>
            <TemplateTitleRow>
              <TemplateTitleBlock>
                <Typography.Title level={2} style={{ margin: 0 }}>
                  Finance
                </Typography.Title>
                <Typography.Text type="secondary">
                  Track revenue, expenses, profit and cashflow with stable,
                  contained dashboards.
                </Typography.Text>
              </TemplateTitleBlock>
            </TemplateTitleRow>

            <FiltersCard className="surface">
              <FinanceFilters
                from={query.from}
                to={query.to}
                view={view}
                groupBy={query.groupBy}
                loading={loading}
                onChangePeriod={handleChangePeriod}
                onChangeView={setView}
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
                    <GridSpan8>
                      <RevenueTrendWidget
                        className="surface"
                        series={data.revenueSeries}
                        loading={loading}
                        subtitle="Revenue trend for the selected period."
                      />
                    </GridSpan8>

                    <GridSpan4>
                      <ExpensesBreakdownWidget
                        className="surface"
                        items={data.expensesByCategory}
                        loading={loading}
                        subtitle="How expenses are distributed."
                      />
                    </GridSpan4>

                    <GridSpan6>
                      <TopServicesTableWidget
                        className="surface"
                        items={data.topServices}
                        loading={loading}
                        subtitle="Top services by revenue."
                      />
                    </GridSpan6>

                    <GridSpan6>
                      <CashflowTableWidget
                        className="surface"
                        items={data.cashflow}
                        loading={loading}
                        subtitle="Latest cashflow entries."
                      />
                    </GridSpan6>
                  </>
                )}

                {view === "revenue" && (
                  <>
                    <GridSpan12>
                      <RevenueTrendWidget
                        className="surface"
                        series={data.revenueSeries}
                        loading={loading}
                        subtitle="Revenue trend, grouped by the selected granularity."
                        heightHint="full"
                      />
                    </GridSpan12>
                    <GridSpan6>
                      <TopServicesTableWidget
                        className="surface"
                        items={data.topServices}
                        loading={loading}
                        subtitle="Top services contributing to revenue."
                      />
                    </GridSpan6>
                    <GridSpan6>
                      <CashflowTableWidget
                        className="surface"
                        items={data.cashflow}
                        loading={loading}
                        subtitle="Incoming/outgoing records impacting revenue."
                      />
                    </GridSpan6>
                  </>
                )}

                {view === "expenses" && (
                  <>
                    <GridSpan6>
                      <ExpensesBreakdownWidget
                        className="surface"
                        items={data.expensesByCategory}
                        loading={loading}
                        subtitle="Expense breakdown by category."
                      />
                    </GridSpan6>
                    <GridSpan6>
                      <CashflowTableWidget
                        className="surface"
                        items={data.cashflow}
                        loading={loading}
                        subtitle="Outgoing records and pending payments."
                      />
                    </GridSpan6>
                  </>
                )}

                {view === "profit" && (
                  <>
                    <GridSpan12>
                      <ProfitTrendWidget
                        className="surface"
                        revenue={data.revenueSeries}
                        expenses={data.expensesSeries}
                        profit={data.profitSeries}
                        loading={loading}
                        subtitle="Profit derived from revenue minus expenses."
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
                        subtitle="All cashflow entries for the selected period."
                        dense={false}
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
