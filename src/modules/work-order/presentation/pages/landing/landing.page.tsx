import React from "react";
import { BasePage } from "@shared/base/base.page";
import { WorkOrderLandingTemplate } from "@modules/work-order/presentation/templates/landing/landing.template";

export class WorkOrderLandingPage extends BasePage {
  protected override options = {
    title: "Work Orders | WorklyHub",
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <WorkOrderLandingTemplate />;
  }
}

export default WorkOrderLandingPage;
