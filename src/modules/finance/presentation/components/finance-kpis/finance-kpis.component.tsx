import React from "react";
import { Card, Row, Col, Skeleton } from "antd";
import { useFinanceApi } from "@modules/finance/services/finance.service";

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

  function formatBR(val: number) {
    return val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  const renderCard = (label: string, value: string, color?: string) => (
    <Card bordered={false} style={{ minHeight: 96, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 12 }}>{label}</div>
        <div style={{ fontSize: 18, fontWeight: 600, color }}>{value}</div>
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
      <Col span={8}>{renderCard("Income", `R$ ${formatBR(receita)}`, "var(--color-success)")}</Col>
      <Col span={8}>{renderCard("Expense", `R$ ${formatBR(despesa)}`, "var(--color-warning)")}</Col>
      <Col span={8}>{renderCard("Profit", `R$ ${formatBR(lucro)}`, lucro < 0 ? "var(--color-danger)" : undefined)}</Col>
    </Row>
  );
}

export default FinanceKpis;
