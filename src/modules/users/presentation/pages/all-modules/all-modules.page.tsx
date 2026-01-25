import React from "react";
import type { ReactNode } from "react";
import { message } from "antd";
import { Briefcase, Calendar, Users, DollarSign, Box, CreditCard, LayoutDashboard } from "lucide-react";

import { applicationService } from "@core/application/application.service";
import type { ApplicationServiceItem } from "@core/application/application-api";
import { BasePage } from "@shared/base/base.page";
import PageSkeleton from "@shared/ui/components/page-skeleton/page-skeleton.component";
import type { ModuleLandingItem } from "@shared/ui/components/module-landing/module-landing.component";
import AllModulesTemplate from "@modules/users/presentation/templates/all-modules/all-modules.template";
import { resolveModulePath } from "@modules/users/presentation/utils/module-navigation";

type State = {
  isLoading: boolean;
  initialized: boolean;
  error?: unknown;
  services?: ApplicationServiceItem[] | null;
};

export class AllModulesPage extends BasePage<{}, State> {
  protected override options = { title: "All modules | WorklyHub", requiresAuth: true };

  public state: State = {
    isLoading: false,
    initialized: false,
    error: undefined,
    services: undefined,
  };

  protected override async onInit(): Promise<void> {
    const existing = applicationService.getServicesValue();
    if (existing != null) {
      this.setSafeState({ services: existing });
      return;
    }

    try {
      const services = await applicationService.fetchServices();
      this.setSafeState({ services: services ?? [] });
    } catch (err) {
      console.error("failed to fetch application services", err);
      message.error("Failed to load modules");
      throw err;
    }
  }

  protected override renderLoading(): React.ReactNode {
    function Wrapper() {
      return <PageSkeleton height="100%" />;
    }

    return <Wrapper />;
  }

  protected override renderError(): React.ReactNode {
    return (
      <div className="container" style={{ padding: "var(--space-6)" }}>
        <div className="surface" style={{ padding: "var(--space-6)", borderRadius: "var(--radius-lg)" }}>
          <h3 style={{ margin: 0 }}>We could not load the modules</h3>
          <p className="text-muted" style={{ marginTop: "var(--space-2)" }}>
            Please try again in a moment.
          </p>
        </div>
      </div>
    );
  }

  protected override renderPage(): React.ReactNode {
    const apiServices: ApplicationServiceItem[] = (this.state.services ?? []) as ApplicationServiceItem[];

    const mapIcon = (key?: string): ReactNode => {
      switch (key) {
        case "calendar":
          return <Calendar />;
        case "users":
          return <Users />;
        case "dollar-sign":
          return <DollarSign />;
        case "credit-card":
          return <CreditCard />;
        case "dashboard":
          return <LayoutDashboard />;
        case "box":
        case "inventory":
        case "stock":
          return <Box />;
        default:
          return <Briefcase />;
      }
    };

    const itemsFromApi: ModuleLandingItem[] = apiServices.map((service) => {
      const item: ModuleLandingItem = {
        id: service.uid,
        title: service.name,
        description: service.description,
        icon: mapIcon(service.icon),
      };

      return {
        ...item,
        to: resolveModulePath({ id: item.id, title: item.title }, undefined),
      };
    });

    const ensureModules = [
      {
        id: "schedule",
        title: "Schedule",
        description: "Manage appointments and availability.",
        icon: <Calendar />,
        keywords: ["schedule", "calendar"],
      },
      {
        id: "inventory",
        title: "Inventory",
        description: "Manage stock and supplies.",
        icon: <Box />,
        keywords: ["inventory", "stock"],
      },
      {
        id: "finance",
        title: "Finance",
        description: "Track revenue and expenses.",
        icon: <DollarSign />,
        keywords: ["finance", "payment"],
      },
      {
        id: "billing",
        title: "Billing",
        description: "Plans, subscriptions, and payments.",
        icon: <CreditCard />,
        keywords: ["billing", "plan", "subscription"],
      },
      {
        id: "clients",
        title: "Clients",
        description: "Manage your client base and history.",
        icon: <Users />,
        keywords: ["client", "customer"],
      },
      {
        id: "company",
        title: "Company",
        description: "Company profile and service catalog.",
        icon: <Briefcase />,
        keywords: ["company", "catalog"],
      },
      {
        id: "people",
        title: "People",
        description: "Team members and staff access.",
        icon: <Users />,
        keywords: ["people", "team", "staff"],
      },
      {
        id: "dashboard",
        title: "Dashboard",
        description: "Business insights and KPIs.",
        icon: <LayoutDashboard />,
        keywords: ["dashboard", "kpi", "insight"],
      },
    ];

    const mergedItems: ModuleLandingItem[] = [...itemsFromApi];

    ensureModules.forEach((module) => {
      const exists = mergedItems.some((item) => {
        const key = `${item.id ?? ""} ${item.title ?? ""}`.toLowerCase();
        return module.keywords.some((k) => key.includes(k));
      });

      if (!exists) {
        mergedItems.push({
          id: module.id,
          title: module.title,
          description: module.description,
          icon: module.icon,
          to: resolveModulePath({ id: module.id, title: module.title }, undefined),
        });
      }
    });

    return <AllModulesTemplate items={mergedItems} />;
  }
}

export default AllModulesPage;
