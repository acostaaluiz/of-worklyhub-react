import React from "react";
import { Card, Statistic, Row, Col } from "antd";
import { useFinanceApi } from "@modules/finance/services/finance.service";

export function FinanceKpis() {
  const api = useFinanceApi();
  const [entries, setEntries] = React.useState<any[]>([]);

  React.useEffect(() => {
    (async () => {
      const data = await api.listEntries();
      setEntries(data);
    })();
  }, [api]);

  const receita = entries.filter(e => e.type === "income").reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const despesa = entries.filter(e => e.type === "expense").reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const lucro = receita - despesa;

  return (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={8}>
        <Card bordered={false}>
          <Statistic title="Receita" value={receita} precision={2} prefix="R$" />
        </Card>
      </Col>
      <Col span={8}>
        <Card bordered={false}>
          <Statistic title="Despesa" value={despesa} precision={2} prefix="R$" />
        </Card>
      </Col>
      <Col span={8}>
        <Card bordered={false}>
          <Statistic title="Lucro" value={lucro} precision={2} prefix="R$" />
        </Card>
      </Col>
    </Row>
  );
}

export default FinanceKpis;
