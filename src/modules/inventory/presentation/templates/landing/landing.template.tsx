import { Box, Tag } from "lucide-react";
import { BaseTemplate } from "@shared/base/base.template";
import {
  ModuleLanding,
  type ModuleLandingItem,
} from "@shared/ui/components/module-landing/module-landing.component";

export function InventoryLandingTemplate() {
  const items: ModuleLandingItem[] = [
    {
      id: "stock",
      title: "Stock items",
      description: "Manage products and inventory levels.",
      to: "/inventory",
      icon: <Box size={18} />,
    },
    {
      id: "categories",
      title: "Categories",
      description: "Organize items by category.",
      to: "/inventory/categories",
      icon: <Tag size={18} />,
    },
  ];

  return (
    <BaseTemplate
      content={
        <ModuleLanding
          title="Inventory"
          headerIcon={<Box size={18} />}
          description="Control stock, items, and categories."
          items={items}
        />
      }
    />
  );
}

export default InventoryLandingTemplate;
