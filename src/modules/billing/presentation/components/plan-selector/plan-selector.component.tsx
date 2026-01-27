import React from "react";
import { Button, Segmented, Space, Typography } from "antd";
import { Check, Sparkles } from "lucide-react";
import { formatMoney } from "@core/utils/mask";
import { BaseComponent } from "@shared/base/base.component";

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
  monthlyPrice: number;
  yearlyPrice: number;
  highlight?: boolean;
  cta: string;
  features: string[];
};

import type { ApplicationPlanItem } from "@core/application/application-api";
import type { BaseProps } from "@shared/base/interfaces/base-props.interface";

export class PlanSelector extends BaseComponent<
  BaseProps & { plans?: ApplicationPlanItem[]; onSelectPlan?: (planId: string, interval?: BillingInterval) => void; recommendedPlanId?: string },
  { isLoading: boolean; error?: unknown; interval: BillingInterval; selectedPlanId?: string }
> {
  public override state = { isLoading: false, error: undefined, interval: "monthly" as BillingInterval, selectedPlanId: undefined };

  private plans: Plan[] = [
    {
      id: "starter",
      name: "Starter",
      description: "For solo professionals getting started.",
      monthlyPrice: 29,
      yearlyPrice: 299,
      cta: "Choose Starter",
      features: [
        "1 user",
        "Up to 50 clients",
        "200 schedules / month",
        "Basic cash flow",
        "Email support",
      ],
    },
    {
      id: "standard",
      name: "Standard",
      description: "Best value for small teams.",
      monthlyPrice: 59,
      yearlyPrice: 599,
      highlight: true,
      cta: "Choose Standard",
      features: [
        "Up to 5 users",
        "Up to 500 clients",
        "Unlimited schedules",
        "Basic reports",
        "Priority support",
      ],
    },
    {
      id: "premium",
      name: "Premium",
      description: "For growing businesses and multiple locations.",
      monthlyPrice: 99,
      yearlyPrice: 999,
      cta: "Choose Premium",
      features: [
        "Unlimited users",
        "Multiple locations",
        "Advanced reports",
        "Role-based permissions",
        "Premium support",
      ],
    },
  ];

  private mapExternalPlans(plans?: ApplicationPlanItem[]): Plan[] | undefined {
    if (!plans || plans.length === 0) return undefined;

    return plans.map((p) => ({
      id: String(p.id),
      name: p.title,
      description: p.subtitle ?? "",
      monthlyPrice: p.monthly_amount,
      yearlyPrice: p.yearly_amount,
      highlight: !!(p as any).highlight,
      cta: `Choose ${p.title}`,
      features: p.supports ?? [],
    }));
  }

  private formatPrice(value: number) {
    return formatMoney(value);
  }

  private discountLabel = "Save 15%";

  private handleSelectPlan = (planId: string) => {
    this.setState({ selectedPlanId: planId });
    console.log("Selected plan:", planId, "interval:", this.state.interval);
    this.props.onSelectPlan?.(planId, this.state.interval);
  };

  override componentDidUpdate(prevProps: Readonly<BaseProps & { plans?: ApplicationPlanItem[]; recommendedPlanId?: string }>): void {
    const plansChanged = prevProps.plans !== this.props.plans;
    const recommendedChanged = prevProps.recommendedPlanId !== this.props.recommendedPlanId;
    if (!plansChanged && !recommendedChanged) return;

    const external = this.mapExternalPlans(this.props.plans);
    const renderList = external && external.length > 0 ? external : this.plans;

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
      const highlighted = this.plans.find((p) => !!p.highlight) ?? this.plans[0];
      if (highlighted && this.state.selectedPlanId !== highlighted.id) this.setState({ selectedPlanId: highlighted.id });
    }
  }

  override componentDidMount(): void {
    super.componentDidMount();
    const external = this.mapExternalPlans(this.props.plans);
    const renderList = external && external.length > 0 ? external : this.plans;

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
      const highlighted = this.plans.find((p) => !!p.highlight) ?? this.plans[0];
      if (highlighted && this.state.selectedPlanId !== highlighted.id) this.setState({ selectedPlanId: highlighted.id });
    }
  }

  protected override renderView(): React.ReactNode {
    const { interval } = this.state;

    const external = this.mapExternalPlans(this.props.plans);
    const renderPlans = external && external.length > 0 ? external : this.plans;

    const selectedId = this.props.recommendedPlanId ?? this.state.selectedPlanId;

    return (
      <div>
        <HeaderRow>
          <div>
            <Typography.Title level={3} style={{ margin: 0 }}>
              Choose your plan
            </Typography.Title>
            <Typography.Text type="secondary">Start simple. Upgrade anytime.</Typography.Text>
          </div>

          <ToggleWrap>
            <Segmented
              value={interval}
              onChange={(v) => this.setState({ interval: v as BillingInterval })}
              options={[
                { label: "Monthly", value: "monthly" },
                { label: "Yearly", value: "yearly" },
              ]}
            />
            {interval === "yearly" ? (
              <PlanMeta>{this.discountLabel}</PlanMeta>
            ) : (
              <PlanMeta>&nbsp;</PlanMeta>
            )}
          </ToggleWrap>
        </HeaderRow>

        <PlanGrid>
          {renderPlans.map((plan) => {
            const price = interval === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
            const isSelected = plan.id === selectedId;

            return (
              <PlanCard key={plan.id} className="surface" $highlight={!!isSelected}>
                <CardTop>
                  {isSelected ? (
                    <RecommendedBadge>
                      <Sparkles size={14} />
                      Recommended
                    </RecommendedBadge>
                  ) : null}

                  <Typography.Title level={4} style={{ margin: 0 }}>
                    {plan.name}
                  </Typography.Title>

                  <Typography.Text type="secondary">{plan.description}</Typography.Text>

                  <PriceRow>
                    <Typography.Title level={2} style={{ margin: 0 }}>
                      {this.formatPrice(price)}
                    </Typography.Title>
                    <Typography.Text type="secondary">/{interval === "monthly" ? "month" : "year"}</Typography.Text>
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
                    <Button type={isSelected ? "primary" : "default"} size="large" block onClick={() => this.handleSelectPlan(plan.id)}>
                      {plan.cta}
                    </Button>

                    <Typography.Text type="secondary" style={{ textAlign: "center" }}>
                      You can change plans later.
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
