import { Settings2, Users } from "lucide-react";
import { BaseTemplate } from "@shared/base/base.template";
import {
  ModuleLanding,
  type ModuleLandingItem,
} from "@shared/ui/components/module-landing/module-landing.component";

export function PeopleLandingTemplate() {
  const items: ModuleLandingItem[] = [
    {
      id: "team",
      title: "Team",
      description: "Manage staff and roles.",
      to: "/people",
      icon: <Users size={18} />,
    },
    {
      id: "settings",
      title: "Settings",
      description: "Configure defaults, validation rules, and module startup tab.",
      to: "/people/settings",
      icon: <Settings2 size={18} />,
    },
  ];

  return (
    <BaseTemplate
      content={
        <ModuleLanding
          title="People"
          headerIcon={<Users size={18} />}
          description="Invite, manage, and organize your team."
          items={items}
        />
      }
    />
  );
}

export default PeopleLandingTemplate;
