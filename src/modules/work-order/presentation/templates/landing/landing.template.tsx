import { Calendar, ClipboardList, ListChecks, Settings2 } from "lucide-react";

import { i18n as appI18n } from "@core/i18n";
import { BaseTemplate } from "@shared/base/base.template";
import {
  ModuleLanding,
  type ModuleLandingItem,
} from "@shared/ui/components/module-landing/module-landing.component";

export function WorkOrderLandingTemplate() {
        const items: ModuleLandingItem[] = [
    {
      id: "work-orders",
      title: appI18n.t("legacyInline.work_order.presentation_templates_landing_landing_template.k001"),
      description: appI18n.t("legacyInline.work_order.presentation_templates_landing_landing_template.k002"),
      meta: appI18n.t("legacyInline.work_order.presentation_templates_landing_landing_template.k003"),
      to: "/work-order",
      icon: <ClipboardList size={18} />,
    },
    {
      id: "calendar",
      title: appI18n.t("legacyInline.work_order.presentation_templates_landing_landing_template.k004"),
      description: appI18n.t("legacyInline.work_order.presentation_templates_landing_landing_template.k005"),
      meta: appI18n.t("legacyInline.work_order.presentation_templates_landing_landing_template.k006"),
      to: "/work-order/calendar",
      icon: <Calendar size={18} />,
    },
    {
      id: "statuses",
      title: appI18n.t("legacyInline.work_order.presentation_templates_landing_landing_template.k007"),
      description: appI18n.t("legacyInline.work_order.presentation_templates_landing_landing_template.k008"),
      meta: appI18n.t("legacyInline.work_order.presentation_templates_landing_landing_template.k009"),
      to: "/work-order/statuses",
      icon: <ListChecks size={18} />,
    },
    {
      id: "settings",
      title: appI18n.t("legacyInline.work_order.presentation_templates_landing_landing_template.k010"),
      description:
        appI18n.t("legacyInline.work_order.presentation_templates_landing_landing_template.k011"),
      meta: appI18n.t("legacyInline.work_order.presentation_templates_landing_landing_template.k012"),
      to: "/work-order/settings",
      icon: <Settings2 size={18} />,
    },
  ];

  return (
    <BaseTemplate
      content={
        <ModuleLanding
          title={appI18n.t("legacyInline.work_order.presentation_templates_landing_landing_template.k013")}
          headerIcon={<ClipboardList size={18} />}
          description={appI18n.t("legacyInline.work_order.presentation_templates_landing_landing_template.k014")}
          items={items}
          variant="soft-accent"
        />
      }
    />
  );
}

export default WorkOrderLandingTemplate;
