import React from "react";
import { Divider, Space, Typography, Button } from "antd";
import { Check } from "lucide-react";
import { BaseComponent } from "@shared/base/base.component";
import { applicationService } from "@core/application/application.service";
import type { ApplicationPlanItem } from "@core/application/application-api";
import { formatMoney } from "@core/utils/currency";

import {
  SummaryCard,
  CardBody,
  Line,
  PriceRow,
  TotalRow,
  Badge,
} from "./order-summary.component.styles";

const mockPlan = {
  name: "Standard",
  cycle: "Yearly",
  price: 599,
  currencySymbol: "$",
  savingsLabel: "Save 15%",
  features: [
    "Up to 5 users",
    "Up to 500 clients",
    "Unlimited schedules",
    "Basic reports",
    "Priority support",
  ],
};

type OrderSummaryState = { isLoading: boolean; error?: unknown; plan?: ApplicationPlanItem | null; interval?: "monthly" | "yearly" };

export class OrderSummary extends BaseComponent<{}, OrderSummaryState> {
  public override state: OrderSummaryState = { isLoading: false, error: undefined, plan: undefined, interval: undefined };

  componentDidMount(): void {
    this.runAsync(async () => {
      try {
        const selected = sessionStorage.getItem("billing.selectedPlanId");
        const interval = (sessionStorage.getItem("billing.selectedPlanInterval") as "monthly" | "yearly") ?? undefined;

        let plans = applicationService.getPlansValue();
        if (!plans) {
          plans = (await applicationService.fetchPlans()) ?? [];
        }

        const found = plans?.find((p) => String(p.id) === String(selected));
        this.setSafeState({ plan: found ?? null, interval });
      } catch {
        // ignore
      }
    }, { setLoading: false, swallowError: true });
  }
  protected override renderView(): React.ReactNode {
    // prefer freshest values from sessionStorage (selection just happened)
    const selectedId = sessionStorage.getItem("billing.selectedPlanId");
    const sessionInterval = (sessionStorage.getItem("billing.selectedPlanInterval") as "monthly" | "yearly") ?? undefined;

    const plans = applicationService.getPlansValue();
    const displayPlan = plans?.find((p) => String(p.id) === String(selectedId)) ?? this.state.plan ?? null;
    const interval = sessionInterval ?? this.state.interval ?? undefined;

    return (
      <SummaryCard className="surface" styles={{ body: { padding: 0 } }}>
        <CardBody>
          <Space orientation="vertical" size={12} style={{ width: "100%" }}>
            <div>
              <Typography.Title level={4} style={{ margin: 0 }}>
                Order summary
              </Typography.Title>
              <Typography.Text type="secondary">Review your plan before confirming.</Typography.Text>
            </div>

            <Divider style={{ margin: "var(--space-4) 0" }} />

            <Line>
              <Typography.Text strong>{displayPlan ? displayPlan.title : mockPlan.name}</Typography.Text>
              <Badge>{displayPlan ? (interval === "yearly" ? "Yearly" : "Monthly") : mockPlan.cycle}</Badge>
            </Line>

            <PriceRow>
              <Typography.Title level={3} style={{ margin: 0 }}>
                {displayPlan
                  ? formatMoney((interval === "yearly" ? displayPlan.yearly_amount ?? displayPlan.monthly_amount : displayPlan.monthly_amount ?? displayPlan.yearly_amount) * 100)
                  : `${mockPlan.currencySymbol}${mockPlan.price}`}
              </Typography.Title>
              <Typography.Text type="secondary">/ {displayPlan ? (interval === "yearly" ? "year" : "month") : "year"}</Typography.Text>
            </PriceRow>

            <Typography.Text type="secondary">{displayPlan ? "" : mockPlan.savingsLabel}</Typography.Text>

            <Divider style={{ margin: "var(--space-4) 0" }} />

            <Space orientation="vertical" size={8} style={{ width: "100%" }}>
              {(displayPlan ? (displayPlan.supports ?? []) : mockPlan.features).map((item) => (
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
              <Typography.Text strong>Total</Typography.Text>
              <Typography.Text strong>
                {displayPlan
                  ? formatMoney((interval === "yearly" ? displayPlan.yearly_amount ?? displayPlan.monthly_amount : displayPlan.monthly_amount ?? displayPlan.yearly_amount) * 100)
                  : `${mockPlan.currencySymbol}${mockPlan.price}`}
              </Typography.Text>
            </TotalRow>

            <Typography.Text type="secondary" style={{ fontSize: "var(--font-size-sm)" }}>
              Taxes may apply depending on your region.
            </Typography.Text>

            <Button size="large" block style={{ borderRadius: "var(--radius-sm)" }}>
              Change plan
            </Button>
          </Space>
        </CardBody>
      </SummaryCard>
    );
  }
}

export default OrderSummary;
