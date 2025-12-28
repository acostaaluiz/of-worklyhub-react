import React, { useEffect, useState } from "react";
import { List, Card, Button, Typography, Popconfirm, message } from "antd";
import { useFinanceApi } from "@modules/finance/services/finance.service";

export function FinanceEntriesList() {
  const api = useFinanceApi();
  const [items, setItems] = useState<any[]>([]);

  async function load() {
    const data = await api.listEntries();
    setItems(data);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(id: string) {
    const ok = await api.removeEntry(id);
    if (ok) {
      message.success("Lançamento removido");
      load();
    } else {
      message.error("Não foi possível remover");
    }
  }

  return (
    <List
      dataSource={items}
      renderItem={(it) => (
        <List.Item>
          <Card className="surface" style={{ width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <Typography.Text strong>{it.description ?? "Lançamento"}</Typography.Text>
                <div style={{ color: "var(--muted)" }}>{it.date}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 600 }}>R$ {Number(it.amount ?? 0).toFixed(2)}</div>
                <div style={{ marginTop: 8 }}>
                  <Popconfirm title="Remover lançamento?" onConfirm={() => handleDelete(it.id)}>
                    <Button size="small" danger>Remover</Button>
                  </Popconfirm>
                </div>
              </div>
            </div>
          </Card>
        </List.Item>
      )}
    />
  );
}

export default FinanceEntriesList;
