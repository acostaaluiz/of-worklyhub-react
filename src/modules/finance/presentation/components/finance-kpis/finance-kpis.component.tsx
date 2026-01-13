import React from "react";
import { loadingService } from "@shared/ui/services/loading.service";
import { Card, Statistic, Row, Col } from "antd";
import { useFinanceApi } from "@modules/finance/services/finance.service";

export function FinanceKpis({ workspaceId }: { workspaceId?: string }) {
  const api = useFinanceApi();
  const [entries, setEntries] = React.useState<any[]>([]);

  React.useEffect(() => {
    (async () => {
      try {
        loadingService.show();
        const data = await api.listEntries({ workspaceId });
        setEntries(data);
      } catch (err) {
        console.debug('FinanceKpis.load error', err);
      } finally {
        loadingService.hide();
      }
    })();
  }, [api, workspaceId]);

  const receita = entries.filter(e => e.type === "income").reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const despesa = entries.filter(e => e.type === "expense").reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const lucro = receita - despesa;

  return (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={8}>
        <Card bordered={false} style={{ minHeight: 96, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Statistic title={<span style={{ fontSize: 12 }}>Income</span>} value={receita} precision={2} prefix="R$" valueStyle={{ fontSize: 18 }} />
        </Card>
      </Col>
      <Col span={8}>
        <Card bordered={false} style={{ minHeight: 96, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Statistic title={<span style={{ fontSize: 12 }}>Expense</span>} value={despesa} precision={2} prefix="R$" valueStyle={{ fontSize: 18 }} />
        </Card>
      </Col>
      <Col span={8}>
        <Card bordered={false} style={{ minHeight: 96, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Statistic title={<span style={{ fontSize: 12 }}>Profit</span>} value={lucro} precision={2} prefix="R$" valueStyle={{ fontSize: 18, whiteSpace: 'nowrap' }} />
        </Card>
      </Col>
    </Row>
  );
}

export default FinanceKpis;
