import React from "react";
import { BasePage } from "@shared/base/base.page";
import { FinanceLandingTemplate } from "@modules/finance/presentation/templates/landing/landing.template";

export class FinanceLandingPage extends BasePage {
  protected override options = {
    title: "Finance overview | WorklyHub",
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <FinanceLandingTemplate />;
  }
}

export default FinanceLandingPage;
