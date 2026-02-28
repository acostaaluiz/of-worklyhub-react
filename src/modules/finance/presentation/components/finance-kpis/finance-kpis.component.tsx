import React from "react";
import dayjs from "dayjs";
import { Card, Row, Col, Skeleton } from "antd";
import { DollarSign, CreditCard, TrendingUp, Percent } from "lucide-react";
import { formatMoney } from "@core/utils/mask";
import { FinanceApi } from "@modules/finance/services/finance-api";
import { httpClient } from "@core/http/client.instance";
import { useFinanceApi } from "@modules/finance/services/finance.service";
import {
  type FinanceValueContext,
  getFinanceValueColor,
} from "@modules/finance/utils/finance-value-status";

export function FinanceKpis({ workspaceId }: { workspaceId?: string }) {
  const api = useFinanceApi();
  const [entries, setEntries] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [dashboardKpis, setDashboardKpis] = React.useState<{
    revenue: number;
    expense: number;
    profit: number;
    margin: number;
  } | null>(null);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const from = dayjs().subtract(30, "day").format("YYYY-MM-DD");
        const to = dayjs().format("YYYY-MM-DD");
        let dashboardLoaded = false;
        try {
          const dashboard = await new FinanceApi(httpClient).getDashboard(workspaceId, {
            start: from,
            end: to,
            bucket: "day",
            cashflowLimit: 6,
            topLimit: 4,
          });
          const kpis = dashboard?.kpis;
          if (kpis) {
            setDashboardKpis({
              revenue: (kpis.revenue_cents ?? 0) / 100,
              expense: (kpis.expense_cents ?? 0) / 100,
              profit: (kpis.profit_cents ?? 0) / 100,
              margin: (kpis.margin_pct ?? 0) > 1 ? (kpis.margin_pct ?? 0) / 100 : (kpis.margin_pct ?? 0),
            });
            dashboardLoaded = true;
          }
        } catch (err) {
          setDashboardKpis(null);
        }

        if (!dashboardLoaded) {
          const data = await api.listEntries({ workspaceId });
          setEntries(data);
        }
      } catch (err) {
        console.debug("FinanceKpis.load error", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [api, workspaceId]);

  const receita = dashboardKpis?.revenue ?? entries.filter((e) => e.type === "income").reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const despesa = dashboardKpis?.expense ?? entries.filter((e) => e.type === "expense").reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const lucro = dashboardKpis?.profit ?? receita - despesa;
  const margem = dashboardKpis?.margin ?? (receita > 0 ? (lucro / receita) : 0);

  const renderCard = (
    label: string,
    value: string,
    rawValue: number,
    context: FinanceValueContext,
    icon?: React.ReactNode
  ) => (
    <Card
      bordered={false}
      style={{ minHeight: 96, display: "flex", flexDirection: "column", padding: 12 }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontSize: 12 }}>{label}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>{icon}</div>
      </div>

      <div style={{ textAlign: "center", flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: getFinanceValueColor(rawValue, { context }) }}>{value}</div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={12} md={6}>
          <Card bordered={false} style={{ minHeight: 96 }}>
            <Skeleton active paragraph={{ rows: 1 }} title={false} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card bordered={false} style={{ minHeight: 96 }}>
            <Skeleton active paragraph={{ rows: 1 }} title={false} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card bordered={false} style={{ minHeight: 96 }}>
            <Skeleton active paragraph={{ rows: 1 }} title={false} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card bordered={false} style={{ minHeight: 96 }}>
            <Skeleton active paragraph={{ rows: 1 }} title={false} />
          </Card>
        </Col>
      </Row>
    );
  }

  return (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col xs={12} md={6}>
        {renderCard("Income", formatMoney(receita), receita, "income", <DollarSign size={16} />)}
      </Col>
      <Col xs={12} md={6}>
        {renderCard("Expense", formatMoney(despesa), despesa, "expense", <CreditCard size={16} />)}
      </Col>
      <Col xs={12} md={6}>
        {renderCard("Profit", formatMoney(lucro), lucro, "neutral", <TrendingUp size={16} />)}
      </Col>
      <Col xs={12} md={6}>
        {renderCard("Margin", `${(margem * 100).toFixed(1)}%`, margem, "neutral", <Percent size={16} />)}
      </Col>
    </Row>
  );
}

export default FinanceKpis;
