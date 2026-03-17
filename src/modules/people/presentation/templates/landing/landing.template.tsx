import { Settings2, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BaseTemplate } from "@shared/base/base.template";
import {
  ModuleLanding,
  type ModuleLandingItem,
} from "@shared/ui/components/module-landing/module-landing.component";

export function PeopleLandingTemplate() {
  const { t } = useTranslation();

  const items: ModuleLandingItem[] = [
    {
      id: "team",
      title: t("people.landing.items.team.title"),
      description: t("people.landing.items.team.description"),
      to: "/people",
      icon: <Users size={18} />,
    },
    {
      id: "settings",
      title: t("people.landing.items.settings.title"),
      description: t("people.landing.items.settings.description"),
      to: "/people/settings",
      icon: <Settings2 size={18} />,
    },
  ];

  return (
    <BaseTemplate
      content={
        <ModuleLanding
          title={t("people.landing.title")}
          headerIcon={<Users size={18} />}
          description={t("people.landing.description")}
          items={items}
        />
      }
    />
  );
}

export default PeopleLandingTemplate;
