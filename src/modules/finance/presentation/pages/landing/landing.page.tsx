import React from "react";

import { i18n as appI18n } from "@core/i18n";
import { BasePage } from "@shared/base/base.page";
import { FinanceLandingTemplate } from "@modules/finance/presentation/templates/landing/landing.template";

export class FinanceLandingPage extends BasePage {
  protected override options = {
    title: `${appI18n.t("finance.pageTitles.landing")} | WorklyHub`,
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <FinanceLandingTemplate />;
  }
}

export default FinanceLandingPage;
