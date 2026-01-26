import React, { useEffect, useState } from "react";
import { Card, Button, Typography, message, Skeleton } from "antd";
import { formatDate, formatMoney } from "@core/utils/mask";
import { useFinanceApi } from "@modules/finance/services/finance.service";
import {
  type FinanceValueContext,
  getFinanceSignedValue,
  getFinanceValueColor,
} from "@modules/finance/utils/finance-value-status";

export function FinanceEntriesList({ workspaceId }: { workspaceId?: string }) {
  const api = useFinanceApi();
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const pageSize = 3;

  async function load() {
    setLoading(true);
    try {
      const data = await api.listEntries({ workspaceId });
      setItems(data);
    } catch (err) {
      console.debug("FinanceEntriesList.load error", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  // Helpers
  function stripCodeFromDescription(desc?: string) {
    if (!desc) return "";
    // remove UUIDs (common pattern) and long hex-like tokens
    return desc.replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, "").trim();
  }

  function getEntryContext(type?: string): FinanceValueContext | undefined {
    const normalized = (type ?? "").toString().toLowerCase();
    if (normalized === "income" || normalized === "in") return "income";
    if (normalized === "expense" || normalized === "out") return "expense";
    if (normalized === "fixed") return "fixed";
    return undefined;
  }

  const totalPages = Math.ceil(items.length / pageSize);
  const start = page * pageSize;
  const visibleItems = items.slice(start, start + pageSize);

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "stretch", marginBottom: 12 }}>
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="surface" style={{ width: "100%", minHeight: 100, padding: "10px" }}>
                <Skeleton active paragraph={{ rows: 1 }} title={false} />
              </Card>
            ))
          : visibleItems.map((it) => (
              <Card key={it.id} className="surface" style={{ width: "100%", minHeight: 100, padding: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                    <Typography.Text strong style={{ display: "block", fontSize: 16 }}>{stripCodeFromDescription(it.description) ?? "Entry"}</Typography.Text>
                    <div style={{ color: "var(--muted)", marginTop: 6, fontSize: 13 }}>{formatDate(it.date)}</div>
                  </div>
                  <div style={{ textAlign: "right", minWidth: 120 }}>
                    {(() => {
                      const amountNum = Number(it.amount ?? 0);
                      const context = getEntryContext(it.type);
                      const signedValue = getFinanceSignedValue(amountNum, context);
                      const isNegative = signedValue < 0;
                      const formatted = formatMoney(Math.abs(amountNum));
                      const color = getFinanceValueColor(amountNum, { context });
                      return (
                        <div style={{ fontWeight: 600, fontSize: 16 }}>
                          {isNegative && <span style={{ color, marginRight: 4 }}>-</span>}
                          <span style={{ color }}>{formatted}</span>
                        </div>
                      );
                    })()}

                    <div style={{ marginTop: 8 }}>
                      <Button size="small" type="primary" shape="round" onClick={() => message.info("Entry info")}>Info</Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 8 }}>
        {page > 0 && (
          <Button onClick={() => setPage(page - 1)}>VOLTAR</Button>
        )}

        {page !== 0 && (
          <Button onClick={() => setPage(0)}>INÍCIO</Button>
        )}

        {page < totalPages - 1 && (
          <Button type="primary" onClick={() => setPage(page + 1)}>VER MAIS</Button>
        )}
      </div>
    </div>
  );
}

export default FinanceEntriesList;
