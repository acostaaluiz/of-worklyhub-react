import React from "react";
import { BasePage } from "@shared/base/base.page";
import { PlanSelectionTemplate } from "../../templates/plan-selection/plan-selection.template";
import { applicationService } from "@core/application/application.service";
import type { ApplicationPlanItem } from "@core/application/application-api";

export class PlanSelectionPage extends BasePage<{}, { initialized: boolean; isLoading: boolean; error?: unknown; plans?: ApplicationPlanItem[] }> {
  protected override options = {
    title: "Plans | WorklyHub",
    requiresAuth: true,
  };

  public state: { initialized: boolean; isLoading: boolean; error?: unknown; plans?: ApplicationPlanItem[] } = {
    initialized: false,
    isLoading: false,
    error: undefined,
    plans: undefined,
  };

  protected override async onInit(): Promise<void> {
    await this.runAsync(async () => {
      const plans = await applicationService.fetchPlans();
      this.setSafeState({ plans: plans ?? [] });
    }, { setLoading: false, swallowError: true });
  }

  protected override renderPage(): React.ReactNode {
    return <PlanSelectionTemplate plans={this.state.plans} />;
  }
}

export default PlanSelectionPage;
