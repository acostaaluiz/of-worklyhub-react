import React from "react";

import { i18n as appI18n } from "@core/i18n";
import { BasePage } from "@shared/base/base.page";
import { WorkOrderLandingTemplate } from "@modules/work-order/presentation/templates/landing/landing.template";

export class WorkOrderLandingPage extends BasePage {
  protected override options = {
    title: `${appI18n.t("workOrder.pageTitles.landing")} | WorklyHub`,
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <WorkOrderLandingTemplate />;
  }
}

export default WorkOrderLandingPage;
