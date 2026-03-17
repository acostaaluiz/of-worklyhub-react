import { Calendar, Settings2 } from "lucide-react";

import { i18n as appI18n } from "@core/i18n";
import { BaseTemplate } from "@shared/base/base.template";
import {
  ModuleLanding,
  type ModuleLandingItem,
} from "@shared/ui/components/module-landing/module-landing.component";

export function ScheduleLandingTemplate() {
        const items: ModuleLandingItem[] = [
    {
      id: "calendar",
      title: appI18n.t("legacyInline.schedule.presentation_templates_landing_landing_template.k001"),
      description: appI18n.t("legacyInline.schedule.presentation_templates_landing_landing_template.k002"),
      to: "/schedule",
      icon: <Calendar size={18} />,
    },
    {
      id: "settings",
      title: appI18n.t("legacyInline.schedule.presentation_templates_landing_landing_template.k003"),
      description: appI18n.t("legacyInline.schedule.presentation_templates_landing_landing_template.k004"),
      to: "/schedule/settings",
      icon: <Settings2 size={18} />,
    },
  ];

  return (
    <BaseTemplate
      content={
        <ModuleLanding
          title={appI18n.t("legacyInline.schedule.presentation_templates_landing_landing_template.k005")}
          headerIcon={<Calendar size={18} />}
          description={appI18n.t("legacyInline.schedule.presentation_templates_landing_landing_template.k006")}
          items={items}
        />
      }
    />
  );
}

export default ScheduleLandingTemplate;
