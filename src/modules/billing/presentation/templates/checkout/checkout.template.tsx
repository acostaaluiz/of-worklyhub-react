import { Typography } from "antd";
import { CreditCard } from "lucide-react";

import { BaseTemplate } from "@shared/base/base.template";

import {
  Shell,
  HeaderRow,
  HeaderText,
  Grid,
  MainColumn,
  AsideColumn,
} from "./checkout.template.styles";

import { CheckoutForm } from "../../components/checkout-form/checkout-form.component";
import { OrderSummary } from "../../components/order-summary/order-summary.component";

export function CheckoutTemplate() {
  return (
    <BaseTemplate
      content={
        <>
          <Shell className="surface">
            <HeaderRow>
              <HeaderText>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <CreditCard size={22} />
                  <Typography.Title level={2} style={{ margin: 0 }}>
                    Checkout
                  </Typography.Title>
                </div>
                <Typography.Text type="secondary">
                  Review your plan and finish the payment securely.
                </Typography.Text>
              </HeaderText>
            </HeaderRow>

            <Grid>
              <MainColumn>
                <CheckoutForm />
              </MainColumn>

              <AsideColumn>
                <OrderSummary />
              </AsideColumn>
            </Grid>
          </Shell>
        </>
      }
    />
  );
}
