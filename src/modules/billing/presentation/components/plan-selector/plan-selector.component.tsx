import { useMemo, useState } from "react";
import { Button, Segmented, Space, Typography } from "antd";
import { Check, Sparkles } from "lucide-react";

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

export function PlanSelector() {
  const [interval, setInterval] = useState<BillingInterval>("monthly");

  const plans = useMemo<Plan[]>(
    () => [
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
    ],
    []
  );

  const formatPrice = (value: number) =>
    value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });

  const discountLabel = "Save 15%";

  const handleSelectPlan = (planId: string) => {
    // presentation-only (futuro: integração com billing service / checkout)
    console.log("Selected plan:", planId, "interval:", interval);
  };

  return (
    <div>
      <HeaderRow>
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Choose your plan
          </Typography.Title>
          <Typography.Text type="secondary">
            Start simple. Upgrade anytime.
          </Typography.Text>
        </div>

        <ToggleWrap>
          <Segmented
            value={interval}
            onChange={(v) => setInterval(v as BillingInterval)}
            options={[
              { label: "Monthly", value: "monthly" },
              { label: "Yearly", value: "yearly" },
            ]}
          />
          {interval === "yearly" ? (
            <PlanMeta>{discountLabel}</PlanMeta>
          ) : (
            <PlanMeta>&nbsp;</PlanMeta>
          )}
        </ToggleWrap>
      </HeaderRow>

      <PlanGrid>
        {plans.map((plan) => {
          const price =
            interval === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;

          return (
            <PlanCard
              key={plan.id}
              className="surface"
              $highlight={!!plan.highlight}
            >
              <CardTop>
                {plan.highlight ? (
                  <RecommendedBadge>
                    <Sparkles size={14} />
                    Recommended
                  </RecommendedBadge>
                ) : null}

                <Typography.Title level={4} style={{ margin: 0 }}>
                  {plan.name}
                </Typography.Title>

                <Typography.Text type="secondary">
                  {plan.description}
                </Typography.Text>

                <PriceRow>
                  <Typography.Title level={2} style={{ margin: 0 }}>
                    {formatPrice(price)}
                  </Typography.Title>
                  <Typography.Text type="secondary">
                    /{interval === "monthly" ? "month" : "year"}
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
                    type={plan.highlight ? "primary" : "default"}
                    size="large"
                    block
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {plan.cta}
                  </Button>

                  <Typography.Text
                    type="secondary"
                    style={{ textAlign: "center" }}
                  >
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
