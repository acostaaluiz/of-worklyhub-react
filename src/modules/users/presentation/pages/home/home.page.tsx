import React from "react";
import { BasePage } from "@shared/base/base.page";
import UsersHomeTemplate from "@modules/users/presentation/templates/home/home.template";
import { Briefcase, Calendar, Users, DollarSign, Box, LayoutGrid } from "lucide-react";
import type { ApplicationServiceItem } from "@core/application/application-api";
import type { ReactNode } from "react";
import { Subscription } from "rxjs";
import { usersService } from "@modules/users/services/user.service";
import { applicationService } from "@core/application/application.service";
import { companyService } from "@modules/company/services/company.service";
import { ScheduleService } from "@modules/schedule/services/schedule.service";
import { FinanceService } from "@modules/finance/services/finance.service";
import { message } from "antd";
import PageSkeleton from "@shared/ui/components/page-skeleton/page-skeleton.component";
import { navigateTo } from "@core/navigation/navigation.service";

export class UsersHomePage extends BasePage<{}, { initialized: boolean; isLoading: boolean; error?: unknown; name?: string; services?: ApplicationServiceItem[] | null; metrics?: { appointmentsToday: number; revenueThisMonthCents?: number | null; nextAppointment?: { title?: string; date?: string; time?: string } } }> {
  protected override options = { title: "Home | WorklyHub", requiresAuth: true };

  private profileSub?: Subscription;

  public state = { isLoading: true, initialized: false, error: undefined, name: undefined, services: undefined, metrics: undefined };

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

    // avoid duplicate fetches (React StrictMode can mount twice in dev)
    const existing = applicationService.getServicesValue();
    if (existing != null) {
      this.setSafeState({ services: existing });
      // still compute metrics even when services are cached — keep skeleton visible while computing
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
        const services = await applicationService.fetchServices();
        this.setSafeState({ services: services ?? [] });

        // compute metrics (schedule + finance)
        try {
          await this.computeAndSetMetrics();
        } catch (e) {
          console.debug("metrics fetch failed", e);
        }
      } catch (err) {
        console.error("failed to fetch application services", err);
        message.error("Failed to load application services");
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
    const apiServices: ApplicationServiceItem[] = (this.state.services ?? []) as ApplicationServiceItem[];

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

    const services: { id: string; title: string; subtitle?: string; icon?: ReactNode }[] = apiServices.map((s: ApplicationServiceItem) => ({
      id: s.uid,
      title: s.name,
      subtitle: s.description,
      icon: mapIcon(s.icon),
    }));

    const findByKeywords = (keywords: string[]) => {
      return services.find((s) => {
        const key = `${s.id ?? ""} ${s.title ?? ""}`.toLowerCase();
        return keywords.some((k) => key.includes(k));
      });
    };

    const withFallbackIcon = (item: { id: string; title: string; subtitle?: string; icon?: ReactNode }, fallbackIcon: ReactNode) => {
      if (item.icon) return item;
      return { ...item, icon: fallbackIcon };
    };

    const scheduleModule = withFallbackIcon(
      findByKeywords(["schedule", "calendar"]) ?? {
        id: "schedule",
        title: "Schedule",
        subtitle: "Manage appointments and availability",
        icon: mapIcon("calendar"),
      },
      <Calendar />
    );

    const inventoryModule = withFallbackIcon(
      findByKeywords(["inventory", "stock"]) ?? {
        id: "inventory",
        title: "Inventory",
        subtitle: "Manage stock and supplies",
        icon: mapIcon("inventory"),
      },
      <Box />
    );

    const financeModule = withFallbackIcon(
      findByKeywords(["finance", "payment"]) ?? {
        id: "finance",
        title: "Finance",
        subtitle: "Track revenue and expenses",
        icon: mapIcon("dollar-sign"),
      },
      <DollarSign />
    );

    const quickModules: { id: string; title: string; subtitle?: string; icon?: ReactNode }[] = [
      scheduleModule,
      inventoryModule,
      financeModule,
      { id: "all-modules", title: "See all", subtitle: "View all available modules", icon: <LayoutGrid /> },
    ];

    const uniqueServices = new Map<string, { id: string; title: string; subtitle?: string; icon?: ReactNode }>();
    services.forEach((s) => {
      const key = `${s.id ?? ""}|${s.title ?? ""}`.toLowerCase();
      uniqueServices.set(key, s);
    });
    [scheduleModule, inventoryModule, financeModule].forEach((s) => {
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
        services={quickModules}
        servicesCount={uniqueServices.size}
        metrics={this.state.metrics}
        onEditCompany={() => {
          navigateTo("/company/introduction");
        }}
      />
    );
  }
}

export default UsersHomePage;
