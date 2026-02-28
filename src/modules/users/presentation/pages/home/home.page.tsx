import React from "react";
import { BasePage } from "@shared/base/base.page";
import UsersHomeTemplate from "@modules/users/presentation/templates/home/home.template";
import { Briefcase, Calendar, Users, DollarSign, Box, LayoutGrid } from "lucide-react";
import type { ReactNode } from "react";
import { Subscription } from "rxjs";
import { usersService } from "@modules/users/services/user.service";
import { usersOverviewService } from "@modules/users/services/overview.service";
import type { UserOverviewModule } from "@modules/users/services/overview-api";
import { companyService } from "@modules/company/services/company.service";
import { ScheduleService } from "@modules/schedule/services/schedule.service";
import { FinanceService } from "@modules/finance/services/finance.service";
import { message } from "antd";
import PageSkeleton from "@shared/ui/components/page-skeleton/page-skeleton.component";
import { navigateTo } from "@core/navigation/navigation.service";

export class UsersHomePage extends BasePage<
  {},
  {
    initialized: boolean;
    isLoading: boolean;
    error?: unknown;
    name?: string;
    modules?: UserOverviewModule[] | null;
    planTitle?: string | null;
    metrics?: { appointmentsToday: number; revenueThisMonthCents?: number | null; nextAppointment?: { title?: string; date?: string; time?: string } };
  }
> {
  protected override options = { title: "Home | WorklyHub", requiresAuth: true };

  private profileSub?: Subscription;

  public state = {
    isLoading: true,
    initialized: false,
    error: undefined,
    name: undefined,
    modules: undefined,
    planTitle: undefined,
    metrics: undefined,
  };

  private async computeAndSetMetrics(): Promise<void> {
    try {
      const schedule = new ScheduleService();
      const finance = new FinanceService();
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, "0");
      const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

      const week = new Date(now);
      week.setDate(now.getDate() + 7);
      const weekStr = `${week.getFullYear()}-${pad(week.getMonth() + 1)}-${pad(week.getDate())}`;

      const ws = companyService.getWorkspaceValue();
      const workspaceId = (ws as any)?.workspaceId ?? (ws as any)?.id ?? undefined;

      const eventsToday = await schedule.getEvents({ from: todayStr, to: todayStr, workspaceId });
      const eventsWeek = await schedule.getEvents({ from: todayStr, to: weekStr, workspaceId });

      const appointmentsToday = Array.isArray(eventsToday) ? eventsToday.length : 0;

      let nextAppointment;
      if (Array.isArray(eventsWeek) && eventsWeek.length > 0) {
        const sorted = eventsWeek.slice().sort((a, b) => {
          if (a.date !== b.date) return a.date < b.date ? -1 : 1;
          return (a.startTime ?? "") < (b.startTime ?? "") ? -1 : 1;
        });
        const first = sorted[0];
        nextAppointment = { title: first.title, date: first.date, time: first.startTime };
      }

      // try to compute revenue for current month
      let revenueThisMonthCents: number | null = null;
      try {
        const rev = await finance.getRevenueForMonth(workspaceId ?? null);
        revenueThisMonthCents = typeof rev === "number" ? rev : null;
      } catch (e) {
        revenueThisMonthCents = null;
      }

      this.setSafeState({ metrics: { appointmentsToday, revenueThisMonthCents, nextAppointment } });
    } catch (e) {
      console.debug("metrics fetch failed", e);
    }
  }

  protected override async onInit(): Promise<void> {
    const current = usersService.getProfileValue();
    if (current?.name) this.setSafeState({ name: current.name });

    this.profileSub = usersService.getProfile$().subscribe((p) => {
      this.setSafeState({ name: p?.name });
    });

    const existingOverview = usersOverviewService.getOverviewValue();
    if (existingOverview?.modules != null && existingOverview.modules.length > 0) {
      this.setSafeState({
        modules: existingOverview.modules,
        planTitle: existingOverview.profile?.planTitle ?? null,
        name: existingOverview.profile?.name ?? this.state.name,
      });
      await this.runAsync(async () => {
        try {
          await this.computeAndSetMetrics();
        } catch (e) {
          console.debug("metrics fetch failed", e);
        }
      }, { setLoading: true });
      return;
    }

    await this.runAsync(async () => {
      try {
        const overview = await usersOverviewService.fetchOverview();
        this.setSafeState({
          modules: overview?.modules ?? [],
          planTitle: overview?.profile?.planTitle ?? null,
          name: overview?.profile?.name ?? this.state.name,
        });

        try {
          await this.computeAndSetMetrics();
        } catch (e) {
          console.debug("metrics fetch failed", e);
        }
      } catch (err) {
        console.error("failed to fetch overview", err);
        message.error("Failed to load modules");
      }
    }, { setLoading: true });
  }

  protected override renderLoading(): React.ReactNode {
    function Wrapper() {
      return <PageSkeleton height="100%" />;
    }

    return <Wrapper />;
  }

  override componentWillUnmount(): void {
    super.componentWillUnmount();
    this.profileSub?.unsubscribe();
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
        case "box":
        case "inventory":
        case "stock":
          return <Box />;
        default:
          return <Briefcase />;
      }
    };

    const services: { id: string; title: string; subtitle?: string; icon?: ReactNode }[] = apiModules.map((s: UserOverviewModule) => ({
      id: s.uid,
      title: s.name,
      subtitle: s.description,
      icon: mapIcon(s.icon),
    }));

    const preferred = [
      { id: "schedule", keywords: ["schedule", "calendar"], fallbackIcon: <Calendar /> },
      { id: "inventory", keywords: ["inventory", "stock"], fallbackIcon: <Box /> },
      { id: "finance", keywords: ["finance", "payment"], fallbackIcon: <DollarSign /> },
    ];

    const selected: { id: string; title: string; subtitle?: string; icon?: ReactNode }[] = [];
    const used = new Set<string>();

    preferred.forEach((pref) => {
      const found = services.find((s) => {
        const key = `${s.id ?? ""} ${s.title ?? ""}`.toLowerCase();
        return key.includes(pref.id) || pref.keywords.some((k) => key.includes(k));
      });
      if (found) {
        selected.push(found.icon ? found : { ...found, icon: pref.fallbackIcon });
        used.add(found.id);
      }
    });

    services.forEach((s) => {
      if (selected.length >= 3) return;
      if (s.id && used.has(s.id)) return;
      selected.push(s.icon ? s : { ...s, icon: mapIcon(s.id) });
      if (s.id) used.add(s.id);
    });

    const quickModules: { id: string; title: string; subtitle?: string; icon?: ReactNode }[] = [
      ...selected,
      { id: "all-modules", title: "See all", subtitle: "View all available modules", icon: <LayoutGrid /> },
    ];

    const uniqueServices = new Map<string, { id: string; title: string; subtitle?: string; icon?: ReactNode }>();
    services.forEach((s) => {
      const key = `${s.id ?? ""}|${s.title ?? ""}`.toLowerCase();
      uniqueServices.set(key, s);
    });

    const ws = companyService.getWorkspaceValue();
    const companyName =
      // prefer explicit name field if present
      (ws as any)?.name ??
      // company_profile may come from API in snake_case
      (ws as any)?.company_profile?.trade_name ??
      // fallback to camelCase variants
      (ws as any)?.tradeName ?? (ws as any)?.fullName ?? undefined;

    const description = (ws as any)?.company_profile?.description ?? (ws as any)?.description ?? undefined;

    return (
      <UsersHomeTemplate
        name={this.state.name}
        companyName={companyName}
        description={description}
        planTitle={this.state.planTitle ?? undefined}
        services={quickModules}
        servicesCount={uniqueServices.size}
        metrics={this.state.metrics}
        onEditCompany={() => {
          navigateTo("/users?tab=company");
        }}
        onOpenTutorials={() => {
          navigateTo("/tutorials");
        }}
      />
    );
  }
}

export default UsersHomePage;
