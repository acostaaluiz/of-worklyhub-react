import { Calendar, Search, Users } from "lucide-react";
import { BaseTemplate } from "@shared/base/base.template";
import {
  ModuleLanding,
  type ModuleLandingItem,
} from "@shared/ui/components/module-landing/module-landing.component";

export function ClientsLandingTemplate() {
  const items: ModuleLandingItem[] = [
    {
      id: "catalog",
      title: "Services catalog",
      description: "Browse available services and providers.",
      to: "/clients",
      icon: <Search size={18} />,
    },
    {
      id: "appointments",
      title: "Schedule",
      description: "Manage appointments in the scheduling module.",
      to: "/schedule",
      icon: <Calendar size={18} />,
    },
    {
      id: "client-360",
      title: "Client 360",
      description: "Single profile with unified schedule, work-order, and finance history.",
      to: "/clients/360",
      icon: <Users size={18} />,
      meta: "Unified relationship timeline",
    },
  ];

  return (
    <BaseTemplate
      content={
        <ModuleLanding
          title="Clients"
          headerIcon={<Users size={18} />}
          description="Access the service catalog, schedule, and client relationship history."
          items={items}
        />
      }
    />
  );
}

export default ClientsLandingTemplate;
