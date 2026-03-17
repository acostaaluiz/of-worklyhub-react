import React from "react";
import { i18n as appI18n } from "@core/i18n";
import { BasePage } from "@shared/base/base.page";
import { CheckoutTemplate } from "../../templates/checkout/checkout.template";


export class CheckoutPage extends BasePage {
  protected override options = {
    title: `${appI18n.t("billing.pageTitles.checkout")} | WorklyHub`,
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <CheckoutTemplate />;
  }
}

export default CheckoutPage;
