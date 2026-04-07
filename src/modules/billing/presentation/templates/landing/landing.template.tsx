import { CreditCard, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BaseTemplate } from "@shared/base/base.template";
import {
  ModuleLanding,
  type ModuleLandingItem,
} from "@shared/ui/components/module-landing/module-landing.component";
import { Users } from "lucide-react";

export function BillingLandingTemplate() {
  const { t } = useTranslation();

  const items: ModuleLandingItem[] = [
    {
      id: "plans",
      title: t("billing.landing.items.plans.title"),
      description: t("billing.landing.items.plans.description"),
      to: "/billing/plans",
      icon: <Sparkles size={18} />,
    },
    {
      id: "checkout",
      title: t("billing.landing.items.checkout.title"),
      description: t("billing.landing.items.checkout.description"),
      to: "/billing/checkout",
      icon: <CreditCard size={18} />,
      meta: t("billing.landing.items.checkout.meta"),
    },
    {
      id: "employees",
      title: t("billing.landing.items.employees.title"),
      description: t("billing.landing.items.employees.description"),
      to: "/billing/employees",
      icon: <Users size={18} />,
      meta: t("billing.landing.items.employees.meta"),
    },
  ];

  return (
    <BaseTemplate
      content={
        <ModuleLanding
          title={t("billing.landing.title")}
          headerIcon={<CreditCard size={18} />}
          description={t("billing.landing.description")}
          items={items}
        />
      }
    />
  );
}

export default BillingLandingTemplate;
