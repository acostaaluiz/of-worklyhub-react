import React from "react";
import { loadingService } from "@shared/ui/services/loading.service";
import { Card, Row, Col } from "antd";
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

  function formatBR(val: number) {
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  return (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={8}>
        <Card bordered={false} style={{ minHeight: 96, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12 }}>Income</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-success)' }}>R$ {formatBR(receita)}</div>
          </div>
        </Card>
      </Col>
      <Col span={8}>
        <Card bordered={false} style={{ minHeight: 96, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12 }}>Expense</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-warning)' }}>R$ {formatBR(despesa)}</div>
          </div>
        </Card>
      </Col>
      <Col span={8}>
        <Card bordered={false} style={{ minHeight: 96, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12 }}>Profit</div>
            <div style={{ fontSize: 18, fontWeight: 600, whiteSpace: 'nowrap', color: lucro < 0 ? 'var(--color-danger)' : 'inherit' }}>R$ {formatBR(lucro)}</div>
          </div>
        </Card>
      </Col>
    </Row>
  );
}

export default FinanceKpis;
