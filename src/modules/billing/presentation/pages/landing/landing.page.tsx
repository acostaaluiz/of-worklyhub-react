import React from "react";
import { BasePage } from "@shared/base/base.page";
import { BillingLandingTemplate } from "@modules/billing/presentation/templates/landing/landing.template";

export class BillingLandingPage extends BasePage {
  protected override options = {
    title: "Billing overview | WorklyHub",
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <BillingLandingTemplate />;
  }
}

export default BillingLandingPage;
