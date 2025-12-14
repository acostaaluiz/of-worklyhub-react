import { BaseTemplate } from "@shared/base/base.template";
import { PrivateFrameLayout } from "@shared/ui/layout/private-frame/private-frame.component";

import { TemplateShell } from "./plan-selection.template.styles";
import { PlanSelector } from "../../components/plan-selector/plan-selector.component";

export function PlanSelectionTemplate() {
  return (
    <BaseTemplate
      content={
        <PrivateFrameLayout>
          <TemplateShell>
            <PlanSelector />
          </TemplateShell>
        </PrivateFrameLayout>
      }
    />
  );
}
