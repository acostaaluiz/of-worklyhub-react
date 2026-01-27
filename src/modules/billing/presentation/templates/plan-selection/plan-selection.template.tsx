import { BaseTemplate } from "@shared/base/base.template";

import { TemplateShell } from "./plan-selection.template.styles";
import { PlanSelector } from "../../components/plan-selector/plan-selector.component";
import type { ApplicationPlanItem } from "@core/application/application-api";

type Props = {
  plans?: ApplicationPlanItem[];
  onSelectPlan?: (planId: string, interval?: "monthly" | "yearly") => void;
  recommendedPlanId?: string;
};

export function PlanSelectionTemplate({ plans, onSelectPlan, recommendedPlanId }: Props) {
  return (
    <BaseTemplate
      content={
        <>
          <TemplateShell>
            <PlanSelector plans={plans} onSelectPlan={onSelectPlan} recommendedPlanId={recommendedPlanId} />
          </TemplateShell>
        </>
      }
    />
  );
}
