import { BarChart3, Megaphone, Sparkles, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

import { BaseTemplate } from "@shared/base/base.template";
import {
  ModuleLanding,
  type ModuleLandingItem,
} from "@shared/ui/components/module-landing/module-landing.component";

export function GrowthLandingTemplate() {
  const { t } = useTranslation();

  const items: ModuleLandingItem[] = [
    {
      id: "autopilot",
      title: t("growth.landing.items.autopilot.title"),
      description: t("growth.landing.items.autopilot.description"),
      meta: t("growth.landing.items.autopilot.meta"),
      to: "/growth",
      icon: <Sparkles size={18} />,
    },
    {
      id: "clients360",
      title: t("growth.landing.items.clients360.title"),
      description: t("growth.landing.items.clients360.description"),
      meta: t("growth.landing.items.clients360.meta"),
      to: "/growth/clients-360",
      icon: <Users size={18} />,
    },
    {
      id: "playbooks",
      title: t("growth.landing.items.playbooks.title"),
      description: t("growth.landing.items.playbooks.description"),
      meta: t("growth.landing.items.playbooks.meta"),
      to: "/growth?tab=playbooks",
      icon: <Megaphone size={18} />,
    },
    {
      id: "attribution",
      title: t("growth.landing.items.attribution.title"),
      description: t("growth.landing.items.attribution.description"),
      meta: t("growth.landing.items.attribution.meta"),
      to: "/growth?tab=attribution",
      icon: <BarChart3 size={18} />,
    },
  ];

  return (
    <BaseTemplate
      content={
        <ModuleLanding
          title={t("growth.landing.title")}
          headerIcon={<Sparkles size={18} />}
          description={t("growth.landing.description")}
          items={items}
          variant="soft-accent"
        />
      }
    />
  );
}

export default GrowthLandingTemplate;
