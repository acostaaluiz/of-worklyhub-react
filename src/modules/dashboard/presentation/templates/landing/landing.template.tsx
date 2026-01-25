import { BarChart3 } from "lucide-react";
import { BaseTemplate } from "@shared/base/base.template";
import {
  ModuleLanding,
  type ModuleLandingItem,
} from "@shared/ui/components/module-landing/module-landing.component";

export function DashboardLandingTemplate() {
  const items: ModuleLandingItem[] = [
    {
      id: "overview",
      title: "Overview",
      description: "Track KPIs and recent performance.",
      to: "/dashboard",
      icon: <BarChart3 size={18} />,
    },
  ];

  return (
    <BaseTemplate
      content={
        <ModuleLanding
          title="Dashboard"
          headerIcon={<BarChart3 size={18} />}
          description="Explore KPIs, revenue, and operational insights."
          items={items}
        />
      }
    />
  );
}

export default DashboardLandingTemplate;
