import React from "react";
import { Divider, Space, Typography, Button } from "antd";
import { Check } from "lucide-react";
import { i18n as appI18n } from "@core/i18n";
import { BaseComponent } from "@shared/base/base.component";
import { formatMoney } from "@core/utils/currency";
import { billingService } from "@modules/billing/services/billing.service";
import type { BillingPlan, BillingCycle } from "@modules/billing/services/billing-api";
import { navigateTo } from "@core/navigation/navigation.service";

import {
  SummaryCard,
  CardBody,
  Line,
  PriceRow,
  TotalRow,
  Badge,
} from "./order-summary.component.styles";

type OrderSummaryState = { isLoading: boolean; error?: DataValue; plan?: BillingPlan | null; interval?: BillingCycle };

export class OrderSummary extends BaseComponent<{}, OrderSummaryState> {
  public override state: OrderSummaryState = { isLoading: false, error: undefined, plan: undefined, interval: undefined };

  private getMockPlan() {
    return {
      name: appI18n.t("billing.planSelector.fallbackPlans.standard.name"),
      cycle: appI18n.t("billing.orderSummary.cycle.yearly"),
      priceCents: 75000,
      savingsLabel: appI18n.t("billing.orderSummary.savingsLabel"),
      features: [
        appI18n.t("billing.orderSummary.mockFeatures.users"),
        appI18n.t("billing.orderSummary.mockFeatures.clients"),
        appI18n.t("billing.orderSummary.mockFeatures.schedules"),
        appI18n.t("billing.orderSummary.mockFeatures.reports"),
        appI18n.t("billing.orderSummary.mockFeatures.support"),
      ],
    };
  }

  componentDidMount(): void {
    this.runAsync(async () => {
      try {
        const selected = sessionStorage.getItem("billing.selectedPlanId");
        const interval = (sessionStorage.getItem("billing.selectedPlanInterval") as "monthly" | "yearly") ?? undefined;

        const plansState = (await billingService.fetchPlans()) ?? null;
        const plans = plansState?.plans ?? [];

        const found = plans?.find((p) => String(p.id) === String(selected));
        this.setSafeState({ plan: found ?? null, interval });
      } catch {
        // ignore
      }
    }, { setLoading: false, swallowError: true });
  }
  protected override renderView(): React.ReactNode {
    const mockPlan = this.getMockPlan();

    // prefer freshest values from sessionStorage (selection just happened)
    const selectedId = sessionStorage.getItem("billing.selectedPlanId");
    const sessionInterval = (sessionStorage.getItem("billing.selectedPlanInterval") as "monthly" | "yearly") ?? undefined;

    const plansState = billingService.getPlansValue();
    const displayPlan = plansState?.plans?.find((p) => String(p.id) === String(selectedId)) ?? this.state.plan ?? null;
    const interval = sessionInterval ?? this.state.interval ?? undefined;

    return (
      <SummaryCard className="surface" styles={{ body: { padding: 0 } }}>
        <CardBody>
          <Space orientation="vertical" size={12} style={{ width: "100%", flex: 1 }}>
            <div>
              <Typography.Title level={4} style={{ margin: 0 }}>
                {appI18n.t("billing.orderSummary.title")}
              </Typography.Title>
              <Typography.Text type="secondary">{appI18n.t("billing.orderSummary.subtitle")}</Typography.Text>
            </div>

            <Divider style={{ margin: "var(--space-4) 0" }} />

            <Line>
              <Typography.Text strong>{displayPlan ? displayPlan.name : mockPlan.name}</Typography.Text>
              <Badge>
                {displayPlan ? (interval === "yearly" ? appI18n.t("billing.orderSummary.cycle.yearly") : appI18n.t("billing.orderSummary.cycle.monthly")) : mockPlan.cycle}
              </Badge>
            </Line>

            <PriceRow>
              <Typography.Title level={3} style={{ margin: 0 }}>
                {displayPlan
                  ? formatMoney(interval === "yearly" ? displayPlan.priceCents.yearly : displayPlan.priceCents.monthly, { currency: displayPlan.currency })
                  : formatMoney(mockPlan.priceCents)}
              </Typography.Title>
              <Typography.Text type="secondary">
                / {displayPlan ? (interval === "yearly" ? appI18n.t("billing.orderSummary.per.year") : appI18n.t("billing.orderSummary.per.month")) : appI18n.t("billing.orderSummary.per.year")}
              </Typography.Text>
            </PriceRow>

            <Typography.Text type="secondary">{displayPlan ? "" : mockPlan.savingsLabel}</Typography.Text>

            <Divider style={{ margin: "var(--space-4) 0" }} />

            <Space orientation="vertical" size={8} style={{ width: "100%" }}>
              {(displayPlan ? (displayPlan.features ?? []) : mockPlan.features).map((item) => (
                <Line key={item}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <Check size={16} />
                    <Typography.Text type="secondary">{item}</Typography.Text>
                  </span>
                </Line>
              ))}
            </Space>

            <Divider style={{ margin: "var(--space-4) 0" }} />

            <TotalRow>
              <Typography.Text strong>{appI18n.t("billing.orderSummary.total")}</Typography.Text>
              <Typography.Text strong>
                {displayPlan
                  ? formatMoney(interval === "yearly" ? displayPlan.priceCents.yearly : displayPlan.priceCents.monthly, { currency: displayPlan.currency })
                  : formatMoney(mockPlan.priceCents)}
              </Typography.Text>
            </TotalRow>

            <Typography.Text type="secondary" style={{ fontSize: "var(--font-size-sm)" }}>
              {appI18n.t("billing.orderSummary.taxes")}
            </Typography.Text>

            <div style={{ marginTop: "auto" }}>
              <Button size="large" block style={{ borderRadius: "var(--radius-sm)" }} onClick={() => navigateTo("/billing/plans")}>
                {appI18n.t("billing.orderSummary.changePlan")}
              </Button>
            </div>
          </Space>
        </CardBody>
      </SummaryCard>
    );
  }
}

export default OrderSummary;
