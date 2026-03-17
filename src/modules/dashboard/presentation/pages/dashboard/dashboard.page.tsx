import React from "react";
import { i18n as appI18n } from "@core/i18n";
import { BasePage } from "@shared/base/base.page";
import { DashboardTemplate } from "../../templates/dashboard/dashboard.template";

export class DashboardPage extends BasePage {
  protected override options = {
    title: `${appI18n.t("dashboard.pageTitles.dashboard")} | WorklyHub`,
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <DashboardTemplate />;
  }
}

export default DashboardPage;
