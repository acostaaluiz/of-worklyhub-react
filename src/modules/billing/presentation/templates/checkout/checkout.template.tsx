import { Typography } from "antd";

import { BaseTemplate } from "@shared/base/base.template";
import { PrivateFrameLayout } from "@shared/ui/layout/private-frame/private-frame.component";

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
        <PrivateFrameLayout>
          <Shell className="surface">
            <HeaderRow>
              <HeaderText>
                <Typography.Title level={2} style={{ margin: 0 }}>
                  Checkout
                </Typography.Title>
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
        </PrivateFrameLayout>
      }
    />
  );
}
