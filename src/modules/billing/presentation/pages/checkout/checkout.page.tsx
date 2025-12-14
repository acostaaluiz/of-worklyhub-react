import React from "react";
import { BasePage } from "@shared/base/base.page";
import { CheckoutTemplate } from "../../templates/checkout/checkout.template";


export class CheckoutPage extends BasePage {
  protected override options = {
    title: "Checkout | WorklyHub",
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <CheckoutTemplate />;
  }
}

export default CheckoutPage;
