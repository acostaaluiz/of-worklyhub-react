import React from "react";
import { Card, Row, Col, Skeleton } from "antd";
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
    context: FinanceValueContext
  ) => (
    <Card bordered={false} style={{ minHeight: 96, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 12 }}>{label}</div>
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
      <Col span={8}>{renderCard("Income", formatMoney(receita), receita, "income")}</Col>
      <Col span={8}>{renderCard("Expense", formatMoney(despesa), despesa, "expense")}</Col>
      <Col span={8}>{renderCard("Profit", formatMoney(lucro), lucro, "neutral")}</Col>
    </Row>
  );
}

export default FinanceKpis;
