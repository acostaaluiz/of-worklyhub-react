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
  getAiTokenTopupSelection,
  getBillingCheckoutKind,
  getEmployeeAddonSelection,
  onBillingCheckoutSessionChange,
  type AiTokenTopupSelection,
  type BillingCheckoutKind,
  type EmployeeAddonSelection,
} from "@modules/billing/services/billing-checkout-session";

import {
  SummaryCard,
  CardBody,
  Line,
  PriceRow,
  TotalRow,
  Badge,
} from "./order-summary.component.styles";

type OrderSummaryState = {
  isLoading: boolean;
  error?: DataValue;
  plan?: BillingPlan | null;
  interval?: BillingCycle;
  checkoutKind: BillingCheckoutKind;
  employeeAddonSelection: EmployeeAddonSelection | null;
  aiTokenTopupSelection: AiTokenTopupSelection | null;
};

export class OrderSummary extends BaseComponent<{}, OrderSummaryState> {
  private unsubscribeCheckoutSessionChange?: () => void;

  public override state: OrderSummaryState = {
    isLoading: false,
    error: undefined,
    plan: undefined,
    interval: undefined,
    checkoutKind: "plan_subscription",
    employeeAddonSelection: null,
    aiTokenTopupSelection: null,
  };

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
    this.unsubscribeCheckoutSessionChange = onBillingCheckoutSessionChange(() => {
      const interval =
        (sessionStorage.getItem("billing.selectedPlanInterval") as BillingCycle) ??
        this.state.interval;

      this.setSafeState({
        checkoutKind: getBillingCheckoutKind(),
        employeeAddonSelection: getEmployeeAddonSelection(),
        aiTokenTopupSelection: getAiTokenTopupSelection(),
        interval,
      });
    });

    this.runAsync(async () => {
      try {
        const selected = sessionStorage.getItem("billing.selectedPlanId");
        const interval = (sessionStorage.getItem("billing.selectedPlanInterval") as "monthly" | "yearly") ?? undefined;
        const checkoutKind = getBillingCheckoutKind();
        const employeeAddonSelection = getEmployeeAddonSelection();
        const aiTokenTopupSelection = getAiTokenTopupSelection();

        const plansState = (await billingService.fetchPlans()) ?? null;
        const plans = plansState?.plans ?? [];

        const found = plans?.find((p) => String(p.id) === String(selected));
        this.setSafeState({
          plan: found ?? null,
          interval,
          checkoutKind,
          employeeAddonSelection,
          aiTokenTopupSelection,
        });
      } catch {
        // ignore
      }
    }, { setLoading: false, swallowError: true });
  }

  componentWillUnmount(): void {
    this.unsubscribeCheckoutSessionChange?.();
    this.unsubscribeCheckoutSessionChange = undefined;
    super.componentWillUnmount();
  }

  protected override renderView(): React.ReactNode {
    const mockPlan = this.getMockPlan();

    // prefer freshest values from sessionStorage (selection just happened)
    const selectedId = sessionStorage.getItem("billing.selectedPlanId");
    const sessionInterval = (sessionStorage.getItem("billing.selectedPlanInterval") as "monthly" | "yearly") ?? undefined;
    const checkoutKind = getBillingCheckoutKind();
    const employeeAddonSelection = getEmployeeAddonSelection() ?? this.state.employeeAddonSelection;
    const aiTokenTopupSelection = getAiTokenTopupSelection() ?? this.state.aiTokenTopupSelection;
    const isEmployeeAddonCheckout = checkoutKind === "employee_addon";
    const isAiTokenTopupCheckout = checkoutKind === "ai_token_topup";

    const plansState = billingService.getPlansValue();
    const displayPlan = plansState?.plans?.find((p) => String(p.id) === String(selectedId)) ?? this.state.plan ?? null;
    const interval = sessionInterval ?? this.state.interval ?? undefined;
    const addonTotalCents = employeeAddonSelection
      ? employeeAddonSelection.unitPriceCents * employeeAddonSelection.quantity
      : 0;
    const addonCycleLabel = employeeAddonSelection?.interval === "yearly"
      ? appI18n.t("billing.orderSummary.cycle.yearly")
      : appI18n.t("billing.orderSummary.cycle.monthly");
    const aiTokenTotalCents = aiTokenTopupSelection?.priceCents ?? 0;

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
              <Typography.Text strong>
                {isEmployeeAddonCheckout
                  ? appI18n.t("billing.orderSummary.employeeAddonTitle")
                  : isAiTokenTopupCheckout
                    ? appI18n.t("billing.orderSummary.aiTokenTopupTitle")
                  : displayPlan
                  ? displayPlan.name
                  : mockPlan.name}
              </Typography.Text>
              <Badge>
                {isEmployeeAddonCheckout
                  ? addonCycleLabel
                  : isAiTokenTopupCheckout
                    ? appI18n.t("billing.orderSummary.cycle.oneTime")
                  : displayPlan
                  ? (interval === "yearly"
                    ? appI18n.t("billing.orderSummary.cycle.yearly")
                    : appI18n.t("billing.orderSummary.cycle.monthly"))
                  : mockPlan.cycle}
              </Badge>
            </Line>

            <PriceRow>
              <Typography.Title level={3} style={{ margin: 0 }}>
                {isEmployeeAddonCheckout
                  ? formatMoney(addonTotalCents, {
                      currency: employeeAddonSelection?.currency ?? "USD",
                    })
                  : isAiTokenTopupCheckout
                    ? formatMoney(aiTokenTotalCents, {
                        currency: aiTokenTopupSelection?.currency ?? "USD",
                      })
                  : displayPlan
                  ? formatMoney(interval === "yearly" ? displayPlan.priceCents.yearly : displayPlan.priceCents.monthly, { currency: displayPlan.currency })
                  : formatMoney(mockPlan.priceCents)}
              </Typography.Title>
              <Typography.Text type="secondary">
                / {isEmployeeAddonCheckout
                  ? (employeeAddonSelection?.interval === "yearly"
                    ? appI18n.t("billing.orderSummary.per.year")
                    : appI18n.t("billing.orderSummary.per.month"))
                  : isAiTokenTopupCheckout
                    ? appI18n.t("billing.orderSummary.per.oneTime")
                  : displayPlan
                  ? (interval === "yearly"
                    ? appI18n.t("billing.orderSummary.per.year")
                    : appI18n.t("billing.orderSummary.per.month"))
                  : appI18n.t("billing.orderSummary.per.year")}
              </Typography.Text>
            </PriceRow>

            {isEmployeeAddonCheckout && employeeAddonSelection ? (
              <Typography.Text type="secondary">
                {appI18n.t("billing.orderSummary.employeeAddonMeta", {
                  quantity: employeeAddonSelection.quantity,
                  unitPrice: formatMoney(employeeAddonSelection.unitPriceCents, {
                    currency: employeeAddonSelection.currency,
                  }),
                  planName: employeeAddonSelection.planName,
                })}
              </Typography.Text>
            ) : isAiTokenTopupCheckout && aiTokenTopupSelection ? (
              <Typography.Text type="secondary">
                {appI18n.t("billing.orderSummary.aiTokenTopupMeta", {
                  tokens: aiTokenTopupSelection.tokens,
                })}
              </Typography.Text>
            ) : (
              <Typography.Text type="secondary">{displayPlan ? "" : mockPlan.savingsLabel}</Typography.Text>
            )}

            <Divider style={{ margin: "var(--space-4) 0" }} />

            <Space orientation="vertical" size={8} style={{ width: "100%" }}>
              {(isEmployeeAddonCheckout
                ? [
                    appI18n.t("billing.orderSummary.employeeAddonFeatures.extraSeats", {
                      count: employeeAddonSelection?.quantity ?? 0,
                    }),
                    appI18n.t("billing.orderSummary.employeeAddonFeatures.currentTotal", {
                      count: employeeAddonSelection?.totalEmployees ?? 0,
                    }),
                    appI18n.t("billing.orderSummary.employeeAddonFeatures.afterCheckout", {
                      count:
                        (employeeAddonSelection?.totalEmployees ?? 0) +
                        (employeeAddonSelection?.quantity ?? 0),
                    }),
                  ]
                : isAiTokenTopupCheckout
                  ? [
                      appI18n.t("billing.orderSummary.aiTokenTopupFeatures.tokens", {
                        count: aiTokenTopupSelection?.tokens ?? 0,
                      }),
                      appI18n.t("billing.orderSummary.aiTokenTopupFeatures.topupBalance"),
                      appI18n.t("billing.orderSummary.aiTokenTopupFeatures.availableNow"),
                    ]
                : (displayPlan ? (displayPlan.features ?? []) : mockPlan.features)).map((item) => (
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
                {isEmployeeAddonCheckout
                  ? formatMoney(addonTotalCents, {
                      currency: employeeAddonSelection?.currency ?? "USD",
                    })
                  : isAiTokenTopupCheckout
                    ? formatMoney(aiTokenTotalCents, {
                        currency: aiTokenTopupSelection?.currency ?? "USD",
                      })
                  : displayPlan
                  ? formatMoney(interval === "yearly" ? displayPlan.priceCents.yearly : displayPlan.priceCents.monthly, { currency: displayPlan.currency })
                  : formatMoney(mockPlan.priceCents)}
              </Typography.Text>
            </TotalRow>

            <Typography.Text type="secondary" style={{ fontSize: "var(--font-size-sm)" }}>
              {appI18n.t("billing.orderSummary.taxes")}
            </Typography.Text>

            <div style={{ marginTop: "auto" }}>
              <Button
                size="large"
                block
                style={{ borderRadius: "var(--radius-sm)" }}
                onClick={() =>
                  navigateTo(
                    isEmployeeAddonCheckout
                      ? "/billing/employees"
                      : isAiTokenTopupCheckout
                        ? "/billing/ai-tokens"
                        : "/billing/plans"
                  )
                }
              >
                {isEmployeeAddonCheckout
                  ? appI18n.t("billing.orderSummary.changeEmployeeAddon")
                  : isAiTokenTopupCheckout
                    ? appI18n.t("billing.orderSummary.changeAiTokenTopup")
                    : appI18n.t("billing.orderSummary.changePlan")}
              </Button>
            </div>
          </Space>
        </CardBody>
      </SummaryCard>
    );
  }
}

export default OrderSummary;
