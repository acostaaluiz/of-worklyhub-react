import React from "react";
import { Button, Space, Typography } from "antd";
import { Check, Sparkles } from "lucide-react";
import { i18n as appI18n } from "@core/i18n";
import { formatMoney } from "@core/utils/currency";
import { BaseComponent } from "@shared/base/base.component";
import type { BaseProps } from "@shared/base/interfaces/base-props.interface";
import type { BillingPlan } from "@modules/billing/services/billing-api";
import BillingCycleToggle from "../billing-cycle-toggle/billing-cycle-toggle.component";

import {
  HeaderRow,
  PlanCard,
  PlanGrid,
  PriceRow,
  PlanMeta,
  FeatureList,
  FeatureItem,
  CardTop,
  CardFooter,
  RecommendedBadge,
  ToggleWrap,
} from "./plan-selector.component.styles";

type BillingInterval = "monthly" | "yearly";

type Plan = {
  id: string;
  name: string;
  description: string;
  monthlyPriceCents: number;
  yearlyPriceCents: number;
  currency?: string;
  highlight?: boolean;
  cta: string;
  features: string[];
};

const PLAN_FEATURE_KEYS_BY_SLUG = {
  starter: [
    "billing.planSelector.features.starter.coreModules",
    "billing.planSelector.features.starter.profileDashboard",
    "billing.planSelector.features.starter.billingPlans",
    "billing.planSelector.features.starter.emailSupport",
  ],
  standard: [
    "billing.planSelector.features.standard.everythingStarter",
    "billing.planSelector.features.standard.peopleInventoryWorkOrder",
    "billing.planSelector.features.standard.financeOperations",
    "billing.planSelector.features.standard.prioritySupport",
  ],
  premium: [
    "billing.planSelector.features.premium.fullAccess",
    "billing.planSelector.features.premium.slaGrowth",
    "billing.planSelector.features.premium.dedicatedSuccess",
    "billing.planSelector.features.premium.onboarding",
  ],
};

type KnownPlanSlug = keyof typeof PLAN_FEATURE_KEYS_BY_SLUG;

const PLAN_SLUG_BY_DB_ID: Record<number, KnownPlanSlug> = {
  1: "starter",
  2: "standard",
  3: "premium",
};

export class PlanSelector extends BaseComponent<
  BaseProps & { plans?: BillingPlan[]; onSelectPlan?: (planId: string, interval?: BillingInterval) => void; recommendedPlanId?: string },
  { isLoading: boolean; error?: DataValue; interval: BillingInterval; selectedPlanId?: string }
> {
  public override state = { isLoading: false, error: undefined, interval: "monthly" as BillingInterval, selectedPlanId: undefined };

  private getFallbackFeaturesBySlug(): Record<KnownPlanSlug, string[]> {
    return {
      starter: PLAN_FEATURE_KEYS_BY_SLUG.starter.map((key) => appI18n.t(key)),
      standard: PLAN_FEATURE_KEYS_BY_SLUG.standard.map((key) => appI18n.t(key)),
      premium: PLAN_FEATURE_KEYS_BY_SLUG.premium.map((key) => appI18n.t(key)),
    };
  }

  private getDefaultPlans(): Plan[] {
    return [
      {
        id: "starter",
        name: appI18n.t("billing.planSelector.fallbackPlans.starter.name"),
        description: appI18n.t("billing.planSelector.fallbackPlans.starter.description"),
        monthlyPriceCents: 3500,
        yearlyPriceCents: 35000,
        currency: "USD",
        cta: appI18n.t("billing.planSelector.cta.choosePlanNamed", {
          planName: appI18n.t("billing.planSelector.fallbackPlans.starter.name"),
        }),
        features: this.getFallbackFeaturesBySlug().starter,
      },
      {
        id: "standard",
        name: appI18n.t("billing.planSelector.fallbackPlans.standard.name"),
        description: appI18n.t("billing.planSelector.fallbackPlans.standard.description"),
        monthlyPriceCents: 7500,
        yearlyPriceCents: 75000,
        currency: "USD",
        highlight: true,
        cta: appI18n.t("billing.planSelector.cta.choosePlanNamed", {
          planName: appI18n.t("billing.planSelector.fallbackPlans.standard.name"),
        }),
        features: this.getFallbackFeaturesBySlug().standard,
      },
      {
        id: "premium",
        name: appI18n.t("billing.planSelector.fallbackPlans.premium.name"),
        description: appI18n.t("billing.planSelector.fallbackPlans.premium.description"),
        monthlyPriceCents: 9900,
        yearlyPriceCents: 99000,
        currency: "USD",
        cta: appI18n.t("billing.planSelector.cta.choosePlanNamed", {
          planName: appI18n.t("billing.planSelector.fallbackPlans.premium.name"),
        }),
        features: this.getFallbackFeaturesBySlug().premium,
      },
    ];
  }

  private mapExternalPlans(plans?: BillingPlan[]): Plan[] | undefined {
    if (!plans || plans.length === 0) return undefined;
    const fallbackFeaturesBySlug = this.getFallbackFeaturesBySlug();

    const resolveFeatures = (plan: BillingPlan): string[] => {
      const idKey = String(plan.id ?? "").trim().toLowerCase();
      const nameKey = String(plan.name ?? "").trim().toLowerCase();
      const slugByDbId = PLAN_SLUG_BY_DB_ID[Number(plan.dbId)];
      const slugById = (PLAN_FEATURE_KEYS_BY_SLUG[idKey as KnownPlanSlug] ? idKey : undefined) as KnownPlanSlug | undefined;
      const slugByName = (PLAN_FEATURE_KEYS_BY_SLUG[nameKey as KnownPlanSlug] ? nameKey : undefined) as KnownPlanSlug | undefined;
      const resolvedSlug = slugByDbId ?? slugById ?? slugByName;
      if (resolvedSlug) return fallbackFeaturesBySlug[resolvedSlug];
      return plan.features ?? [];
    };

    return plans.map((p) => ({
      id: String(p.id),
      name: p.name,
      description: p.description ?? "",
      monthlyPriceCents: p.priceCents.monthly,
      yearlyPriceCents: p.priceCents.yearly,
      currency: p.currency,
      highlight: !!(p.recommended ?? (p as DataMap).highlight),
      cta: appI18n.t("billing.planSelector.cta.choosePlanNamed", { planName: p.name }),
      features: resolveFeatures(p),
    }));
  }

  private formatPrice(value: number, currency?: string) {
    return formatMoney(value, currency ? { currency } : undefined);
  }

  private handleSelectPlan = (planId: string) => {
    this.setState({ selectedPlanId: planId });
    this.props.onSelectPlan?.(planId, this.state.interval);
  };

  override componentDidUpdate(prevProps: Readonly<BaseProps & { plans?: BillingPlan[]; recommendedPlanId?: string }>): void {
    const plansChanged = prevProps.plans !== this.props.plans;
    const recommendedChanged = prevProps.recommendedPlanId !== this.props.recommendedPlanId;
    if (!plansChanged && !recommendedChanged) return;

    const defaultPlans = this.getDefaultPlans();
    const external = this.mapExternalPlans(this.props.plans);
    const renderList = external && external.length > 0 ? external : defaultPlans;

    // prefer recommendedPlanId when provided
    const recId = this.props.recommendedPlanId;
    if (recId) {
      const rec = renderList.find((p) => p.id === recId);
      if (rec && this.state.selectedPlanId !== rec.id) {
        this.setState({ selectedPlanId: rec.id });
        return;
      }
    }

    if (external && external.length > 0) {
      const highlighted = external.find((p) => !!p.highlight) ?? external[0];
      if (highlighted && this.state.selectedPlanId !== highlighted.id) this.setState({ selectedPlanId: highlighted.id });
    } else {
      const highlighted = defaultPlans.find((p) => !!p.highlight) ?? defaultPlans[0];
      if (highlighted && this.state.selectedPlanId !== highlighted.id) this.setState({ selectedPlanId: highlighted.id });
    }
  }

  override componentDidMount(): void {
    super.componentDidMount();
    const defaultPlans = this.getDefaultPlans();
    const external = this.mapExternalPlans(this.props.plans);
    const renderList = external && external.length > 0 ? external : defaultPlans;

    // if page provided a recommended id, prefer it
    const recId = this.props.recommendedPlanId;
    if (recId) {
      const rec = renderList.find((p) => p.id === recId);
      if (rec && this.state.selectedPlanId !== rec.id) {
        this.setState({ selectedPlanId: rec.id });
        return;
      }
    }

    if (external && external.length > 0) {
      const highlighted = external.find((p) => !!p.highlight) ?? external[0];
      if (highlighted && this.state.selectedPlanId !== highlighted.id) this.setState({ selectedPlanId: highlighted.id });
    } else {
      const highlighted = defaultPlans.find((p) => !!p.highlight) ?? defaultPlans[0];
      if (highlighted && this.state.selectedPlanId !== highlighted.id) this.setState({ selectedPlanId: highlighted.id });
    }
  }

  protected override renderView(): React.ReactNode {
    const { interval } = this.state;
    const defaultPlans = this.getDefaultPlans();

    const external = this.mapExternalPlans(this.props.plans);
    const renderPlans = external && external.length > 0 ? external : defaultPlans;

    const selectedId = this.props.recommendedPlanId ?? this.state.selectedPlanId;

    return (
      <div data-cy="billing-plan-selector">
        <HeaderRow>
          <div>
            <Typography.Title level={3} style={{ margin: 0 }}>
              {appI18n.t("billing.planSelector.headerTitle")}
            </Typography.Title>
            <Typography.Text type="secondary">{appI18n.t("billing.planSelector.headerSubtitle")}</Typography.Text>
          </div>

          <ToggleWrap>
            <BillingCycleToggle
              value={interval}
              onChange={(v) => this.setState({ interval: v as BillingInterval })}
              monthlyLabel={appI18n.t("billing.planSelector.interval.monthly")}
              yearlyLabel={appI18n.t("billing.planSelector.interval.yearly")}
              dataCyPrefix="billing-plan-interval-toggle"
            />
            {interval === "yearly" ? (
              <PlanMeta>{appI18n.t("billing.planSelector.discountLabel")}</PlanMeta>
            ) : (
              <PlanMeta>&nbsp;</PlanMeta>
            )}
          </ToggleWrap>
        </HeaderRow>

        <PlanGrid>
          {renderPlans.map((plan) => {
            const price = interval === "monthly" ? plan.monthlyPriceCents : plan.yearlyPriceCents;
            const isSelected = plan.id === selectedId;

            return (
              <PlanCard key={plan.id} className="surface" $highlight={!!isSelected} data-cy={`billing-plan-card-${plan.id}`}>
                <CardTop>
                  {isSelected ? (
                    <RecommendedBadge>
                      <Sparkles size={14} />
                      {appI18n.t("billing.planSelector.recommended")}
                    </RecommendedBadge>
                  ) : null}

                  <Typography.Title level={4} style={{ margin: 0 }}>
                    {plan.name}
                  </Typography.Title>

                  <Typography.Text type="secondary">{plan.description}</Typography.Text>

                  <PriceRow>
                    <Typography.Title level={2} style={{ margin: 0 }}>
                      {this.formatPrice(price, plan.currency)}
                    </Typography.Title>
                    <Typography.Text type="secondary">
                      /{interval === "monthly" ? appI18n.t("billing.planSelector.per.month") : appI18n.t("billing.planSelector.per.year")}
                    </Typography.Text>
                  </PriceRow>

                  <FeatureList>
                    {plan.features.map((feature) => (
                      <FeatureItem key={feature}>
                        <Check size={16} />
                        <span>{feature}</span>
                      </FeatureItem>
                    ))}
                  </FeatureList>
                </CardTop>

                <CardFooter>
                  <Space direction="vertical" size={10} style={{ width: "100%" }}>
                    <Button
                      type={isSelected ? "primary" : "default"}
                      size="large"
                      block
                      onClick={() => this.handleSelectPlan(plan.id)}
                      data-cy={`billing-plan-select-${plan.id}`}
                    >
                      {plan.cta}
                    </Button>

                    <Typography.Text type="secondary" style={{ textAlign: "center" }}>
                      {appI18n.t("billing.planSelector.canChangeLater")}
                    </Typography.Text>
                  </Space>
                </CardFooter>
              </PlanCard>
            );
          })}
        </PlanGrid>
      </div>
    );
  }
}

export default PlanSelector;
