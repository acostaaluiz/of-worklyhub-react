import { Typography } from "antd";
import { CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

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
                    {t("billing.checkout.header.title")}
                  </Typography.Title>
                </div>
                <Typography.Text type="secondary">
                  {t("billing.checkout.header.subtitle")}
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
