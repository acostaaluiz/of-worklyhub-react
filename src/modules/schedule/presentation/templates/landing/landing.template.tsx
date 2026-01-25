import { Calendar } from "lucide-react";
import { BaseTemplate } from "@shared/base/base.template";
import {
  ModuleLanding,
  type ModuleLandingItem,
} from "@shared/ui/components/module-landing/module-landing.component";

export function ScheduleLandingTemplate() {
  const items: ModuleLandingItem[] = [
    {
      id: "calendar",
      title: "Calendar",
      description: "View and organize appointments.",
      to: "/schedule",
      icon: <Calendar size={18} />,
    },
  ];

  return (
    <BaseTemplate
      content={
        <ModuleLanding
          title="Schedule"
          headerIcon={<Calendar size={18} />}
          description="Manage appointments, availability, and your daily agenda."
          items={items}
        />
      }
    />
  );
}

export default ScheduleLandingTemplate;
