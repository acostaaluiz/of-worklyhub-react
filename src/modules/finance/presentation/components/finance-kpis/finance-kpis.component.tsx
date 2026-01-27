import React from "react";
import { Card, Row, Col, Skeleton } from "antd";
import { DollarSign, CreditCard, TrendingUp } from "lucide-react";
import { formatMoney } from "@core/utils/mask";
import { useFinanceApi } from "@modules/finance/services/finance.service";
import {
  type FinanceValueContext,
  getFinanceValueColor,
} from "@modules/finance/utils/finance-value-status";

export function FinanceKpis({ workspaceId }: { workspaceId?: string }) {
  const api = useFinanceApi();
  const [entries, setEntries] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await api.listEntries({ workspaceId });
        setEntries(data);
      } catch (err) {
        console.debug("FinanceKpis.load error", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [api, workspaceId]);

  const receita = entries.filter((e) => e.type === "income").reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const despesa = entries.filter((e) => e.type === "expense").reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const lucro = receita - despesa;

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
        <Col span={8}>
          <Card bordered={false} style={{ minHeight: 96 }}>
            <Skeleton active paragraph={{ rows: 1 }} title={false} />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} style={{ minHeight: 96 }}>
            <Skeleton active paragraph={{ rows: 1 }} title={false} />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} style={{ minHeight: 96 }}>
            <Skeleton active paragraph={{ rows: 1 }} title={false} />
          </Card>
        </Col>
      </Row>
    );
  }

  return (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={8}>
        {renderCard("Income", formatMoney(receita), receita, "income", <DollarSign size={16} />)}
      </Col>
      <Col span={8}>
        {renderCard("Expense", formatMoney(despesa), despesa, "expense", <CreditCard size={16} />)}
      </Col>
      <Col span={8}>
        {renderCard("Profit", formatMoney(lucro), lucro, "neutral", <TrendingUp size={16} />)}
      </Col>
    </Row>
  );
}

export default FinanceKpis;
