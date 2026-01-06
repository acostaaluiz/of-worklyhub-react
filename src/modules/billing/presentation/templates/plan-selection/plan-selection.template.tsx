import { BaseTemplate } from "@shared/base/base.template";
import { PrivateFrameLayout } from "@shared/ui/layout/private-frame/private-frame.component";

import { TemplateShell } from "./plan-selection.template.styles";
import { PlanSelector } from "../../components/plan-selector/plan-selector.component";
import type { ApplicationPlanItem } from "@core/application/application-api";

type Props = {
  plans?: ApplicationPlanItem[];
};

export function PlanSelectionTemplate({ plans }: Props) {
  return (
    <BaseTemplate
      content={
        <PrivateFrameLayout>
          <TemplateShell>
            <PlanSelector plans={plans} />
          </TemplateShell>
        </PrivateFrameLayout>
      }
    />
  );
}
