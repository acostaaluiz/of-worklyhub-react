import { ClipboardList, ListChecks } from "lucide-react";
import { BaseTemplate } from "@shared/base/base.template";
import {
  ModuleLanding,
  type ModuleLandingItem,
} from "@shared/ui/components/module-landing/module-landing.component";

export function WorkOrderLandingTemplate() {
  const items: ModuleLandingItem[] = [
    {
      id: "work-orders",
      title: "Work orders",
      description: "Track, prioritize, and dispatch work orders.",
      to: "/work-order",
      icon: <ClipboardList size={18} />,
    },
    {
      id: "statuses",
      title: "Statuses",
      description: "Configure the workflow stages for work orders.",
      to: "/work-order/statuses",
      icon: <ListChecks size={18} />,
    },
  ];

  return (
    <BaseTemplate
      content={
        <ModuleLanding
          title="Work Orders"
          headerIcon={<ClipboardList size={18} />}
          description="Plan, execute, and close work requests with full visibility."
          items={items}
        />
      }
    />
  );
}

export default WorkOrderLandingTemplate;
