import { Briefcase, Box, CheckSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BaseTemplate } from "@shared/base/base.template";
import {
  ModuleLanding,
  type ModuleLandingItem,
} from "@shared/ui/components/module-landing/module-landing.component";

export function CompanyLandingTemplate() {
  const { t } = useTranslation();

  const items: ModuleLandingItem[] = [
    {
      id: "setup",
      title: t("company.landing.items.setup.title"),
      description: t("company.landing.items.setup.description"),
      to: "/company/introduction",
      icon: <Briefcase size={18} />,
    },
    {
      id: "services",
      title: t("company.landing.items.services.title"),
      description: t("company.landing.items.services.description"),
      to: "/company/services",
      icon: <Box size={18} />,
    },
    {
      id: "slas",
      title: t("company.landing.items.slas.title"),
      description: t("company.landing.items.slas.description"),
      to: "/company/slas",
      icon: <CheckSquare size={18} />,
    },
  ];

  return (
    <BaseTemplate
      content={
        <ModuleLanding
          title={t("company.landing.title")}
          headerIcon={<Briefcase size={18} />}
          description={t("company.landing.description")}
          items={items}
        />
      }
    />
  );
}

export default CompanyLandingTemplate;
