import { Calendar, Search, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BaseTemplate } from "@shared/base/base.template";
import {
  ModuleLanding,
  type ModuleLandingItem,
} from "@shared/ui/components/module-landing/module-landing.component";

export function ClientsLandingTemplate() {
  const { t } = useTranslation();

  const items: ModuleLandingItem[] = [
    {
      id: "catalog",
      title: t("clients.landing.items.catalog.title"),
      description: t("clients.landing.items.catalog.description"),
      to: "/clients",
      icon: <Search size={18} />,
    },
    {
      id: "appointments",
      title: t("clients.landing.items.appointments.title"),
      description: t("clients.landing.items.appointments.description"),
      to: "/schedule",
      icon: <Calendar size={18} />,
    },
    {
      id: "client-360",
      title: t("clients.landing.items.client360.title"),
      description: t("clients.landing.items.client360.description"),
      to: "/clients/360",
      icon: <Users size={18} />,
      meta: t("clients.landing.items.client360.meta"),
    },
  ];

  return (
    <BaseTemplate
      content={
        <ModuleLanding
          title={t("clients.landing.title")}
          headerIcon={<Users size={18} />}
          description={t("clients.landing.description")}
          items={items}
        />
      }
    />
  );
}

export default ClientsLandingTemplate;
