import React, { useEffect, useState } from "react";
import { loadingService } from "@shared/ui/services/loading.service";
import { List, Card, Button, Typography, Popconfirm, message } from "antd";
import { useFinanceApi } from "@modules/finance/services/finance.service";

export function FinanceEntriesList({ workspaceId }: { workspaceId?: string }) {
  const api = useFinanceApi();
  const [items, setItems] = useState<any[]>([]);

  async function load() {
    try {
      loadingService.show();
      const data = await api.listEntries({ workspaceId });
      setItems(data);
    } catch (err) {
      console.debug('FinanceEntriesList.load error', err);
    } finally {
      loadingService.hide();
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  async function handleDelete(id: string) {
    try {
      loadingService.show();
      const ok = await api.removeEntry(id);
      if (ok) {
        message.success("Entry removed");
        await load();
      } else {
        message.error("Could not remove entry");
      }
    } catch (err) {
      message.error("Could not remove entry");
    } finally {
      loadingService.hide();
    }
  }

  return (
    <List
      dataSource={items}
      renderItem={(it) => (
        <List.Item>
          <Card className="surface" style={{ width: "100%", minHeight: 110, padding: '18px' }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
              <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                <Typography.Text strong style={{ display: 'block', fontSize: 16 }}>{it.description ?? "Entry"}</Typography.Text>
                <div style={{ color: "var(--muted)", marginTop: 6, fontSize: 13 }}>{it.date}</div>
              </div>
              <div style={{ textAlign: "right", minWidth: 120 }}>
                <div style={{ fontWeight: 600, fontSize: 16 }}>R$ {Number(it.amount ?? 0).toFixed(2)}</div>
                <div style={{ marginTop: 8 }}>
                  <Popconfirm title="Remove entry?" onConfirm={() => handleDelete(it.id)}>
                    <Button size="small" danger>Remove</Button>
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
