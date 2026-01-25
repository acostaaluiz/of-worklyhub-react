import { useEffect, useState } from "react";
import { Calendar, Heart, Search, Users } from "lucide-react";
import { BaseTemplate } from "@shared/base/base.template";
import {
  ModuleLanding,
  type ModuleLandingItem,
} from "@shared/ui/components/module-landing/module-landing.component";
import { getAvailableServices } from "@modules/clients/services/clients.service";

export function ClientsLandingTemplate() {
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [serviceTitle, setServiceTitle] = useState<string | undefined>(undefined);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const services = await getAvailableServices();
        if (!active) return;
        const first = services?.[0];
        setServiceId(first?.id ? String(first.id) : null);
        setServiceTitle(first?.title ?? undefined);
      } catch {
        if (!active) return;
        setServiceId(null);
        setServiceTitle(undefined);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const detailPath = serviceId ? `/clients/service/${serviceId}` : undefined;
  const detailMeta = serviceId
    ? serviceTitle
      ? `Example: ${serviceTitle}`
      : "Example: Service"
    : "Select a service in the catalog.";

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
      title: "Appointments",
      description: "Track upcoming and past bookings.",
      to: "/clients/appointments",
      icon: <Calendar size={18} />,
    },
    {
      id: "service-detail",
      title: "Service detail",
      description: "Open a specific service page.",
      to: detailPath,
      icon: <Heart size={18} />,
      meta: detailMeta,
      disabled: !detailPath,
    },
  ];

  return (
    <BaseTemplate
      content={
        <ModuleLanding
          title="Clients"
          headerIcon={<Users size={18} />}
          description="Access the service catalog and appointment history."
          items={items}
        />
      }
    />
  );
}

export default ClientsLandingTemplate;
