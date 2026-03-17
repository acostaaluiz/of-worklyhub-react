import { BarChart3 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BaseTemplate } from "@shared/base/base.template";
import {
  ModuleLanding,
  type ModuleLandingItem,
} from "@shared/ui/components/module-landing/module-landing.component";

export function DashboardLandingTemplate() {
  const { t } = useTranslation();

  const items: ModuleLandingItem[] = [
    {
      id: "overview",
      title: t("dashboard.landing.items.overview.title"),
      description: t("dashboard.landing.items.overview.description"),
      to: "/dashboard",
      icon: <BarChart3 size={18} />,
    },
  ];

  return (
    <BaseTemplate
      content={
        <ModuleLanding
          title={t("dashboard.landing.title")}
          headerIcon={<BarChart3 size={18} />}
          description={t("dashboard.landing.description")}
          items={items}
        />
      }
    />
  );
}

export default DashboardLandingTemplate;
