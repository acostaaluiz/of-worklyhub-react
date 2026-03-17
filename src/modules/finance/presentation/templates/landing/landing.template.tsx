import { Briefcase, CheckSquare, DollarSign, Lightbulb, Sparkles } from "lucide-react";

import { i18n as appI18n } from "@core/i18n";
import { BaseTemplate } from "@shared/base/base.template";
import {
  ModuleLanding,
  type ModuleLandingItem,
} from "@shared/ui/components/module-landing/module-landing.component";

export function FinanceLandingTemplate() {
        const items: ModuleLandingItem[] = [
    {
      id: "overview",
      title: appI18n.t("legacyInline.finance.presentation_templates_landing_landing_template.k001"),
      description: appI18n.t("legacyInline.finance.presentation_templates_landing_landing_template.k002"),
      to: "/finance",
      icon: <DollarSign size={18} />,
    },
    {
      id: "services",
      title: appI18n.t("legacyInline.finance.presentation_templates_landing_landing_template.k003"),
      description: appI18n.t("legacyInline.finance.presentation_templates_landing_landing_template.k004"),
      to: "/finance/services",
      icon: <Briefcase size={18} />,
    },
    {
      id: "suggestions",
      title: appI18n.t("legacyInline.finance.presentation_templates_landing_landing_template.k005"),
      description: appI18n.t("legacyInline.finance.presentation_templates_landing_landing_template.k006"),
      to: "/finance/suggestions",
      icon: <Sparkles size={18} />,
    },
    {
      id: "actionable-insights",
      title: appI18n.t("legacyInline.finance.presentation_templates_landing_landing_template.k007"),
      description: appI18n.t("legacyInline.finance.presentation_templates_landing_landing_template.k008"),
      to: "/finance?view=insights",
      icon: <Lightbulb size={18} />,
    },
    {
      id: "entries",
      title: appI18n.t("legacyInline.finance.presentation_templates_landing_landing_template.k009"),
      description: appI18n.t("legacyInline.finance.presentation_templates_landing_landing_template.k010"),
      to: "/finance/entries",
      icon: <CheckSquare size={18} />,
    },
  ];

  return (
    <BaseTemplate
      content={
        <ModuleLanding
          title={appI18n.t("legacyInline.finance.presentation_templates_landing_landing_template.k011")}
          headerIcon={<DollarSign size={18} />}
          description={appI18n.t("legacyInline.finance.presentation_templates_landing_landing_template.k012")}
          items={items}
        />
      }
    />
  );
}

export default FinanceLandingTemplate;
