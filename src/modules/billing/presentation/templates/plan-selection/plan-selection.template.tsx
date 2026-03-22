import { BaseTemplate } from "@shared/base/base.template";

import { TemplateShell } from "./plan-selection.template.styles";
import { PlanSelector } from "../../components/plan-selector/plan-selector.component";
import type { BillingPlan } from "@modules/billing/services/billing-api";

type Props = {
  plans?: BillingPlan[];
  onSelectPlan?: (planId: string, interval?: "monthly" | "yearly") => void;
  recommendedPlanId?: string;
};

export function PlanSelectionTemplate({ plans, onSelectPlan, recommendedPlanId }: Props) {
  return (
    <BaseTemplate
      content={
        <>
          <TemplateShell data-cy="billing-plan-selection-page">
            <PlanSelector plans={plans} onSelectPlan={onSelectPlan} recommendedPlanId={recommendedPlanId} />
          </TemplateShell>
        </>
      }
    />
  );
}
