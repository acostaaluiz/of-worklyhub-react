import { Briefcase, CheckSquare, DollarSign, Sparkles } from "lucide-react";
import { BaseTemplate } from "@shared/base/base.template";
import {
  ModuleLanding,
  type ModuleLandingItem,
} from "@shared/ui/components/module-landing/module-landing.component";

export function FinanceLandingTemplate() {
  const items: ModuleLandingItem[] = [
    {
      id: "overview",
      title: "Overview",
      description: "Track revenue, profit, and trends.",
      to: "/finance",
      icon: <DollarSign size={18} />,
    },
    {
      id: "services",
      title: "Services performance",
      description: "Analyze revenue per service.",
      to: "/finance/services",
      icon: <Briefcase size={18} />,
    },
    {
      id: "suggestions",
      title: "Suggestions",
      description: "Discover insights and growth ideas.",
      to: "/finance/suggestions",
      icon: <Sparkles size={18} />,
    },
    {
      id: "entries",
      title: "Entries",
      description: "Register income and expenses.",
      to: "/finance/entries",
      icon: <CheckSquare size={18} />,
    },
  ];

  return (
    <BaseTemplate
      content={
        <ModuleLanding
          title="Finance"
          headerIcon={<DollarSign size={18} />}
          description="Control cash flow, entries, and performance."
          items={items}
        />
      }
    />
  );
}

export default FinanceLandingTemplate;
