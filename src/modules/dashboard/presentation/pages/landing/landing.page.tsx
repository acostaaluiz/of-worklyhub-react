import React from "react";
import { BasePage } from "@shared/base/base.page";
import { DashboardLandingTemplate } from "@modules/dashboard/presentation/templates/landing/landing.template";

export class DashboardLandingPage extends BasePage {
  protected override options = {
    title: "Dashboard overview | WorklyHub",
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <DashboardLandingTemplate />;
  }
}

export default DashboardLandingPage;
