import React from "react";
import { i18n as appI18n } from "@core/i18n";
import { BasePage } from "@shared/base/base.page";
import { DashboardLandingTemplate } from "@modules/dashboard/presentation/templates/landing/landing.template";

export class DashboardLandingPage extends BasePage {
  protected override options = {
    title: `${appI18n.t("dashboard.pageTitles.landing")} | WorklyHub`,
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <DashboardLandingTemplate />;
  }
}

export default DashboardLandingPage;
