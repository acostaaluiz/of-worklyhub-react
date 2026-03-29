import React, { useEffect, useState } from "react";
import { List, Card, Button, Tag, Typography } from "antd";
import { PlusCircle, ReceiptText, Sparkles } from "lucide-react";
import { formatMoneyFromCents } from "@core/utils/mask";
import { i18n as appI18n } from "@core/i18n";
import type { CompanyServiceModel } from "@modules/company/interfaces/service.model";
import { FinanceService } from "@modules/finance/services/finance.service";
import { getFinanceValueColor } from "@modules/finance/utils/finance-value-status";

type Props = {
  onSelect?: (svc: CompanyServiceModel, suggestedCents: number) => void;
};

type SuggestedServiceItem = CompanyServiceModel & {
  suggestedCents: number;
  confidence?: number | null;
  why?: string;
  actions?: Array<{
    id: string;
    label: string;
    kind:
      | "increase-price"
      | "decrease-price"
      | "bundle"
      | "monitor"
      | "collect-data";
  }>;
  rationale?: string;
  origin?: "rules" | "ai";
};

export function ServicesFinanceList({ onSelect }: Props) {
        const svc = React.useMemo(() => new FinanceService(), []);
  const isMobileViewport =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 768px)").matches;
  const [items, setItems] = useState<SuggestedServiceItem[]>([]);

  useEffect(() => {
    (async () => {
      const data = await svc.listServicesWithSuggestions();
      setItems(data);
    })();
  }, [svc]);

  return (
    <List
      grid={{ gutter: 12, column: isMobileViewport ? 1 : 2 }}
      dataSource={items}
      renderItem={(it) => (
        <List.Item>
          <Card className="surface" style={{ minHeight: 126 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "100%",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: isMobileViewport ? "flex-start" : "center",
                    flexDirection: isMobileViewport ? "column" : "row",
                    gap: 8,
                  }}
                >
                  <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                      <ReceiptText size={14} />
                      <Typography.Title
                        level={5}
                        style={{
                          margin: 0,
                          whiteSpace: isMobileViewport ? "normal" : "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {it.title}
                      </Typography.Title>
                    </div>
                  </div>

                  <div style={{ marginLeft: isMobileViewport ? 0 : 12 }}>
                    <Typography.Text
                      type="secondary"
                      style={{
                        color: getFinanceValueColor((it.priceCents ?? 0) / 100, {
                          context: "income",
                        }),
                      }}
                    >
                      {formatMoneyFromCents(it.priceCents ?? 0)}
                    </Typography.Text>
                  </div>
                </div>

                <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <Tag>
                    {appI18n.t("legacyInline.finance.presentation_components_services_finance_list_services_finance_list_component.k001")}: {formatMoneyFromCents(it.priceCents ?? 0)}
                  </Tag>
                  <Tag
                    color="green"
                    icon={<Sparkles size={12} />}
                    style={{
                      color: getFinanceValueColor((it.suggestedCents ?? 0) / 100, {
                        context: "income",
                      }),
                    }}
                  >
                    {appI18n.t("legacyInline.finance.presentation_components_services_finance_list_services_finance_list_component.k002")}: {formatMoneyFromCents(it.suggestedCents ?? 0)}
                  </Tag>
                  {typeof it.confidence === "number" ? (
                    <Tag>{`${appI18n.t("legacyInline.finance.presentation_components_services_finance_list_services_finance_list_component.k003")}: ${(it.confidence * 100).toFixed(0)}%`}</Tag>
                  ) : null}
                  {it.origin ? <Tag>{`${appI18n.t("legacyInline.finance.presentation_components_services_finance_list_services_finance_list_component.k004")}: ${it.origin.toUpperCase()}`}</Tag> : null}
                </div>

                <div style={{ marginTop: 8 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      color: getFinanceValueColor((it.suggestedCents ?? 0) / 100, {
                        context: "income",
                      }),
                    }}
                  >
                    {appI18n.t("legacyInline.finance.presentation_components_services_finance_list_services_finance_list_component.k005")}: {formatMoneyFromCents((it.suggestedCents ?? 0) - (it.priceCents ?? 0))}
                  </div>
                  {(it.why ?? it.rationale) ? (
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {it.why ?? it.rationale}
                    </Typography.Text>
                  ) : null}
                  {Array.isArray(it.actions) && it.actions.length > 0 ? (
                    <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {it.actions.slice(0, 2).map((action) => (
                        <Tag key={action.id} color="blue">
                          {action.label}
                        </Tag>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                <Button
                  size="small"
                  icon={<PlusCircle size={14} />}
                  onClick={() => onSelect?.(it, it.suggestedCents)}
                >
                  {appI18n.t("legacyInline.finance.presentation_components_services_finance_list_services_finance_list_component.k006")}
                </Button>
              </div>
            </div>
          </Card>
        </List.Item>
      )}
    />
  );
}

export default ServicesFinanceList;
