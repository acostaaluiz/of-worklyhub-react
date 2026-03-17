import { Box, Settings2, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BaseTemplate } from "@shared/base/base.template";
import {
  ModuleLanding,
  type ModuleLandingItem,
} from "@shared/ui/components/module-landing/module-landing.component";

export function InventoryLandingTemplate() {
  const { t } = useTranslation();

  const items: ModuleLandingItem[] = [
    {
      id: "stock",
      title: t("inventory.landing.items.stock.title"),
      description: t("inventory.landing.items.stock.description"),
      to: "/inventory",
      icon: <Box size={18} />,
    },
    {
      id: "categories",
      title: t("inventory.landing.items.categories.title"),
      description: t("inventory.landing.items.categories.description"),
      to: "/inventory/categories",
      icon: <Tag size={18} />,
    },
    {
      id: "settings",
      title: t("inventory.landing.items.settings.title"),
      description: t("inventory.landing.items.settings.description"),
      to: "/inventory/settings",
      icon: <Settings2 size={18} />,
    },
  ];

  return (
    <BaseTemplate
      content={
        <ModuleLanding
          title={t("inventory.landing.title")}
          headerIcon={<Box size={18} />}
          description={t("inventory.landing.description")}
          items={items}
        />
      }
    />
  );
}

export default InventoryLandingTemplate;
