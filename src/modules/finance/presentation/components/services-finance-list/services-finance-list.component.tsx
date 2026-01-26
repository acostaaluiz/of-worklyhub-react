import React, { useEffect, useState } from "react";
import { List, Card, Button, Typography } from "antd";
import { formatMoneyFromCents } from "@core/utils/mask";
import type { CompanyServiceModel } from "@modules/company/interfaces/service.model";
import { FinanceService } from "@modules/finance/services/finance.service";
import { getFinanceValueColor } from "@modules/finance/utils/finance-value-status";

type Props = {
  onSelect?: (svc: CompanyServiceModel, suggestedCents: number) => void;
};

export function ServicesFinanceList({ onSelect }: Props) {
  const svc = React.useMemo(() => new FinanceService(), []);
  const [items, setItems] = useState<(CompanyServiceModel & { suggestedCents: number })[]>([]);

  useEffect(() => {
    (async () => {
      const data = await svc.listServicesWithSuggestions();
      setItems(data);
    })();
  }, [svc]);

  return (
    <List
      grid={{ gutter: 12, column: 2 }}
      dataSource={items}
      renderItem={(it) => (
        <List.Item>
          <Card className="surface" style={{ minHeight: 110 }}>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                    <Typography.Title level={5} style={{ margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.title}</Typography.Title>
                  </div>

                  <div style={{ marginLeft: 12 }}>
                    <Typography.Text type="secondary" style={{ color: getFinanceValueColor((it.priceCents ?? 0) / 100, { context: "income" }) }}>
                      {formatMoneyFromCents(it.priceCents ?? 0)}
                    </Typography.Text>
                  </div>
                </div>

                <div style={{ marginTop: 8 }}>
                  <div style={{ fontWeight: 600, color: getFinanceValueColor((it.suggestedCents ?? 0) / 100, { context: "income" }) }}>
                    Suggested: {formatMoneyFromCents(it.suggestedCents ?? 0)}
                  </div>
                </div>
              </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                <Button size="small" onClick={() => onSelect?.(it, it.suggestedCents)}>Add as expense</Button>
              </div>
            </div>
          </Card>
        </List.Item>
      )}
    />
  );
}

export default ServicesFinanceList;
