import { BarChart3, Megaphone, Sparkles, Users } from "lucide-react";

import { BaseTemplate } from "@shared/base/base.template";
import {
  ModuleLanding,
  type ModuleLandingItem,
} from "@shared/ui/components/module-landing/module-landing.component";

export function GrowthLandingTemplate() {
  const items: ModuleLandingItem[] = [
    {
      id: "autopilot",
      title: "Growth autopilot",
      description: "Prioritize opportunities and dispatch retention playbooks.",
      meta: "Execution board",
      to: "/growth",
      icon: <Sparkles size={18} />,
    },
    {
      id: "clients-360",
      title: "Client 360",
      description: "Review profile and timeline before dispatching campaigns.",
      meta: "Context view",
      to: "/clients/360",
      icon: <Users size={18} />,
    },
    {
      id: "playbooks",
      title: "Playbooks",
      description: "Configure channels and cadence for each growth objective.",
      meta: "Retention, upsell, recovery",
      to: "/growth?tab=playbooks",
      icon: <Megaphone size={18} />,
    },
    {
      id: "attribution",
      title: "Attribution",
      description: "Track converted opportunities and recovered revenue.",
      meta: "Impact analytics",
      to: "/growth?tab=attribution",
      icon: <BarChart3 size={18} />,
    },
  ];

  return (
    <BaseTemplate
      content={
        <ModuleLanding
          title="Growth"
          headerIcon={<Sparkles size={18} />}
          description="Automate retention and reactivation flows connected to your operation."
          items={items}
          variant="soft-accent"
        />
      }
    />
  );
}

export default GrowthLandingTemplate;
