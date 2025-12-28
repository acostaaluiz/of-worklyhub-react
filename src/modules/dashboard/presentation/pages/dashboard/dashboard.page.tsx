import React from "react";
import { BasePage } from "@shared/base/base.page";
import { DashboardTemplate } from "../../templates/dashboard/dashboard.template";

export class DashboardPage extends BasePage {
  protected override options = {
    title: "Dashboard | WorklyHub",
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <DashboardTemplate />;
  }
}

export default DashboardPage;
