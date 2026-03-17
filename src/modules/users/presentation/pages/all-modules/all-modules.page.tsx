import React from "react";
import type { ReactNode } from "react";
import { message } from "antd";
import { i18n as appI18n } from "@core/i18n";
import {
  Briefcase,
  Calendar,
  Users,
  DollarSign,
  Box,
  CreditCard,
  LayoutDashboard,
  ClipboardList,
  Sparkles,
} from "lucide-react";

import { usersOverviewService } from "@modules/users/services/overview.service";
import type { UserOverviewModule } from "@modules/users/services/overview-api";
import { BasePage } from "@shared/base/base.page";
import PageSkeleton from "@shared/ui/components/page-skeleton/page-skeleton.component";
import type { ModuleLandingItem } from "@shared/ui/components/module-landing/module-landing.component";
import AllModulesTemplate from "@modules/users/presentation/templates/all-modules/all-modules.template";
import { resolveModulePath } from "@modules/users/presentation/utils/module-navigation";
import { ensureGrowthModule } from "@modules/users/presentation/utils/overview-modules";
import { getLocalizedModuleCopy } from "@modules/users/presentation/utils/module-localization";

type State = {
  isLoading: boolean;
  initialized: boolean;
  error?: DataValue;
  modules?: UserOverviewModule[] | null;
  planTitle?: string | null;
};

export class AllModulesPage extends BasePage<{}, State> {
  protected override options = { title: `${appI18n.t("allModules.pageTitles.allModules")} | WorklyHub`, requiresAuth: true };

  public state: State = {
    isLoading: false,
    initialized: false,
    error: undefined,
    modules: undefined,
    planTitle: undefined,
  };

  protected override async onInit(): Promise<void> {
    const existing = usersOverviewService.getOverviewValue();
    if (existing?.modules != null && existing.modules.length > 0) {
      this.setSafeState({ modules: existing.modules, planTitle: existing.profile?.planTitle ?? null });
      return;
    }

    try {
      const overview = await usersOverviewService.fetchOverview();
      this.setSafeState({
        modules: overview?.modules ?? [],
        planTitle: overview?.profile?.planTitle ?? null,
      });
    } catch (err) {
      console.error("failed to fetch overview", err);
      message.error(appI18n.t("allModules.messages.failedLoadModules"));
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
          <h3 style={{ margin: 0 }}>{appI18n.t("allModules.error.title")}</h3>
          <p className="text-muted" style={{ marginTop: "var(--space-2)" }}>
            {appI18n.t("allModules.error.description")}
          </p>
        </div>
      </div>
    );
  }

  protected override renderPage(): React.ReactNode {
    const apiModules: UserOverviewModule[] = (this.state.modules ?? []) as UserOverviewModule[];

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
        case "clipboard-list":
        case "work-order":
        case "workorder":
        case "work-orders":
          return <ClipboardList />;
        case "sparkles":
        case "growth":
        case "megaphone":
        case "rocket":
          return <Sparkles />;
        default:
          return <Briefcase />;
      }
    };

    const itemsFromApi: ModuleLandingItem[] = ensureGrowthModule(apiModules).map((service) => {
      const to = resolveModulePath({ id: service.uid, title: service.name }, undefined);
      const localized = getLocalizedModuleCopy(service, to);

      const item: ModuleLandingItem = {
        id: service.uid,
        title: localized.title,
        description: localized.description,
        icon: mapIcon(service.icon),
      };

      return {
        ...item,
        to,
      };
    });

    return (
      <div data-cy="all-modules-page">
        <AllModulesTemplate items={itemsFromApi} planTitle={this.state.planTitle ?? undefined} />
      </div>
    );
  }
}

export default AllModulesPage;
