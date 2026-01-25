import { CreditCard, Sparkles } from "lucide-react";
import { BaseTemplate } from "@shared/base/base.template";
import {
  ModuleLanding,
  type ModuleLandingItem,
} from "@shared/ui/components/module-landing/module-landing.component";

export function BillingLandingTemplate() {
  const items: ModuleLandingItem[] = [
    {
      id: "plans",
      title: "Plans",
      description: "Compare subscription plans and upgrades.",
      to: "/billing/plans",
      icon: <Sparkles size={18} />,
    },
    {
      id: "checkout",
      title: "Checkout",
      description: "Finalize plan selection and payment.",
      to: "/billing/checkout",
      icon: <CreditCard size={18} />,
      meta: "After selecting a plan",
    },
  ];

  return (
    <BaseTemplate
      content={
        <ModuleLanding
          title="Billing"
          headerIcon={<CreditCard size={18} />}
          description="Manage plans, subscriptions, and payments."
          items={items}
        />
      }
    />
  );
}

export default BillingLandingTemplate;
