import React from "react";
import { BasePage } from "@shared/base/base.page";
import { PlanSelectionTemplate } from "../../templates/plan-selection/plan-selection.template";

export class PlanSelectionPage extends BasePage {
  protected override options = {
    title: "Plans | WorklyHub",
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <PlanSelectionTemplate />;
  }
}

export default PlanSelectionPage;
