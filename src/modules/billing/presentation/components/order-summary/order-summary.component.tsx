import { Divider, Space, Typography, Button } from "antd";
import { Check } from "lucide-react";

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

export function OrderSummary() {
  return (
    <SummaryCard className="surface" styles={{ body: { padding: 0 } }}>
      <CardBody>
        <Space orientation="vertical" size={12} style={{ width: "100%" }}>
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>
              Order summary
            </Typography.Title>
            <Typography.Text type="secondary">
              Review your plan before confirming.
            </Typography.Text>
          </div>

          <Divider style={{ margin: "var(--space-4) 0" }} />

          <Line>
            <Typography.Text strong>{mockPlan.name}</Typography.Text>
            <Badge>{mockPlan.cycle}</Badge>
          </Line>

          <PriceRow>
            <Typography.Title level={3} style={{ margin: 0 }}>
              {mockPlan.currencySymbol}
              {mockPlan.price}
            </Typography.Title>
            <Typography.Text type="secondary">/ year</Typography.Text>
          </PriceRow>

          <Typography.Text type="secondary">
            {mockPlan.savingsLabel}
          </Typography.Text>

          <Divider style={{ margin: "var(--space-4) 0" }} />

          <Space orientation="vertical" size={8} style={{ width: "100%" }}>
            {mockPlan.features.map((item) => (
              <Line key={item}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
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
              {mockPlan.currencySymbol}
              {mockPlan.price}
            </Typography.Text>
          </TotalRow>

          <Typography.Text
            type="secondary"
            style={{ fontSize: "var(--font-size-sm)" }}
          >
            Taxes may apply depending on your region.
          </Typography.Text>

          <Button
            size="large"
            block
            style={{ borderRadius: "var(--radius-sm)" }}
          >
            Change plan
          </Button>
        </Space>
      </CardBody>
    </SummaryCard>
  );
}
