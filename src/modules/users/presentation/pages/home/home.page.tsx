import React from "react";
import { BasePage } from "@shared/base/base.page";
import UsersHomeTemplate from "@modules/users/presentation/templates/home/home.template";
import { Briefcase, Calendar, Users, DollarSign, Box } from "lucide-react";
import type { ApplicationServiceItem } from "@core/application/application-api";
import type { ReactNode } from "react";
import { Subscription } from "rxjs";
import { usersService } from "@modules/users/services/user.service";
import { applicationService } from "@core/application/application.service";
import { companyService } from "@modules/company/services/company.service";
import { ScheduleService } from "@modules/schedule/services/schedule.service";
import { loadingService } from "@shared/ui/services/loading.service";
import { message } from "antd";
import { navigateTo } from "@core/navigation/navigation.service";

export class UsersHomePage extends BasePage<{}, { initialized: boolean; isLoading: boolean; error?: unknown; name?: string; services?: ApplicationServiceItem[] | null; metrics?: { appointmentsToday: number; revenueThisMonthCents?: number | null; nextAppointment?: { title?: string; date?: string; time?: string } } }> {
  protected override options = { title: "Home | WorklyHub", requiresAuth: true };

  private profileSub?: Subscription;

  public state = { isLoading: false, initialized: false, error: undefined, name: undefined, services: undefined, metrics: undefined };

  private async computeAndSetMetrics(): Promise<void> {
    try {
      const schedule = new ScheduleService();
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, "0");
      const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

      const week = new Date(now);
      week.setDate(now.getDate() + 7);
      const weekStr = `${week.getFullYear()}-${pad(week.getMonth() + 1)}-${pad(week.getDate())}`;

      const eventsToday = await schedule.getEvents({ from: todayStr, to: todayStr });
      const eventsWeek = await schedule.getEvents({ from: todayStr, to: weekStr });

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

      this.setSafeState({ metrics: { appointmentsToday, revenueThisMonthCents: null, nextAppointment } });
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
      // still compute metrics even when services are cached
      void this.computeAndSetMetrics();
      return;
    }

    loadingService.show();
    try {
      const services = await applicationService.fetchServices();
      this.setSafeState({ services: services ?? [] });

      // Fetch schedule events to compute simple metrics (appointments today, next appointment)
      try {
        const schedule = new ScheduleService();
        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, "0");
        const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

        const week = new Date(now);
        week.setDate(now.getDate() + 7);
        const weekStr = `${week.getFullYear()}-${pad(week.getMonth() + 1)}-${pad(week.getDate())}`;

        const eventsToday = await schedule.getEvents({ from: todayStr, to: todayStr });
        const eventsWeek = await schedule.getEvents({ from: todayStr, to: weekStr });

        const appointmentsToday = Array.isArray(eventsToday) ? eventsToday.length : 0;

        // find next upcoming event in week (prefer nearest date/time)
        let nextAppointment;
        if (Array.isArray(eventsWeek) && eventsWeek.length > 0) {
          // naive sort by date+time
          const sorted = eventsWeek.slice().sort((a, b) => {
            if (a.date !== b.date) return a.date < b.date ? -1 : 1;
            return (a.startTime ?? "") < (b.startTime ?? "") ? -1 : 1;
          });
          const first = sorted[0];
          nextAppointment = { title: first.title, date: first.date, time: first.startTime };
        }

        this.setSafeState({ metrics: { appointmentsToday, revenueThisMonthCents: null, nextAppointment } });
      } catch (e) {
        // ignore metrics errors
        console.debug("metrics fetch failed", e);
      }

    } catch (err) {
      console.error("failed to fetch application services", err);
      message.error("Failed to load application services");
    } finally {
      loadingService.hide();
    }
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

    const services: { id: string; title: string; subtitle?: string; icon?: ReactNode }[] = apiServices.map((s: ApplicationServiceItem) => ({ id: s.uid, title: s.name, subtitle: s.description, icon: mapIcon(s.icon) }));

    // Ensure inventory module card is available in the quick modules section.
    const hasInventory = services.some((s) => {
      const key = `${s.id ?? ""} ${s.title ?? ""}`.toLowerCase();
      return key.includes("inventory") || key.includes("stock");
    });

    if (!hasInventory) {
      services.push({ id: "inventory", title: "Inventory", subtitle: "Manage stock and supplies", icon: mapIcon("inventory") });
    }

    // Ensure people (staff/team) module card is available in the quick modules section.
    const hasPeople = services.some((s) => {
      const key = `${s.id ?? ""} ${s.title ?? ""}`.toLowerCase();
      return key.includes("people") || key.includes("team") || key.includes("staff");
    });

    if (!hasPeople) {
      services.push({ id: "people", title: "People", subtitle: "Manage staff and team", icon: mapIcon("users") });
    }

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
        services={services}
        metrics={this.state.metrics}
        onEditCompany={() => {
          navigateTo("/company/introduction");
        }}
      />
    );
  }
}

export default UsersHomePage;
