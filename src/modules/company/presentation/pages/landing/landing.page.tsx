import React from "react";
import { i18n as appI18n } from "@core/i18n";
import { BasePage } from "@shared/base/base.page";
import { CompanyLandingTemplate } from "@modules/company/presentation/templates/landing/landing.template";

export class CompanyLandingPage extends BasePage {
  protected override options = {
    title: `${appI18n.t("company.pageTitles.landing")} | WorklyHub`,
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <CompanyLandingTemplate />;
  }
}

export default CompanyLandingPage;
