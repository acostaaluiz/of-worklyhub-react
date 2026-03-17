import React from "react";
import { i18n as appI18n } from "@core/i18n";
import { BasePage } from "@shared/base/base.page";
import { BillingLandingTemplate } from "@modules/billing/presentation/templates/landing/landing.template";

export class BillingLandingPage extends BasePage {
  protected override options = {
    title: `${appI18n.t("billing.pageTitles.landing")} | WorklyHub`,
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <BillingLandingTemplate />;
  }
}

export default BillingLandingPage;
