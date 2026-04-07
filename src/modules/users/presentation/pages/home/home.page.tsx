import React from "react";
import { i18n as appI18n } from "@core/i18n";
import { BasePage } from "@shared/base/base.page";
import UsersHomeTemplate from "@modules/users/presentation/templates/home/home.template";
import { Briefcase, Calendar, Users, DollarSign, Box, LayoutGrid, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { Subscription } from "rxjs";
import { usersService } from "@modules/users/services/user.service";
import { usersOverviewService } from "@modules/users/services/overview.service";
import type { UserOverviewModule } from "@modules/users/services/overview-api";
import { companyService } from "@modules/company/services/company.service";
import { ScheduleService } from "@modules/schedule/services/schedule.service";
import { FinanceService } from "@modules/finance/services/finance.service";
import { listWorkOrderOverview } from "@modules/work-order/services/work-order.http.service";
import { getInventoryAlerts } from "@modules/inventory/services/inventory.http.service";
import { usersNotificationsService } from "@modules/users/services/notifications.service";
import { message } from "antd";
import PageSkeleton from "@shared/ui/components/page-skeleton/page-skeleton.component";
import { navigateTo } from "@core/navigation/navigation.service";
import { ensureGrowthModule } from "@modules/users/presentation/utils/overview-modules";
import { resolveModulePath } from "@modules/users/presentation/utils/module-navigation";
import {
  getLocalizedModuleCopy,
  resolveModuleCatalogKey,
} from "@modules/users/presentation/utils/module-localization";

const DEFAULT_HOME_SUMMARY_POLLING_INTERVAL_MS = 900000;
const MIN_HOME_SUMMARY_POLLING_INTERVAL_MS = 900000;

type HomeMetrics = {
  appointmentsToday: number;
  revenueThisMonthCents?: number | null;
  nextAppointment?: { title?: string; date?: string; time?: string };
  overdueWorkOrders?: number;
  inventoryAlerts?: number;
  unreadNotifications?: number;
  highPriorityUnreadNotifications?: number;
};

type RuntimeEnv = { __WORKLYHUB_RUNTIME_ENV__?: Record<string, string | undefined> };

function resolveHomeSummaryPollingIntervalMs(): number {
  const runtimeEnv = (globalThis as RuntimeEnv).__WORKLYHUB_RUNTIME_ENV__;
  const raw =
    runtimeEnv?.VITE_HOME_SUMMARY_POLLING_INTERVAL_MS ??
    (import.meta.env.VITE_HOME_SUMMARY_POLLING_INTERVAL_MS as string | undefined);
  const parsed = Number(raw);

  if (!Number.isFinite(parsed) || parsed < MIN_HOME_SUMMARY_POLLING_INTERVAL_MS) {
    return DEFAULT_HOME_SUMMARY_POLLING_INTERVAL_MS;
  }

  return Math.floor(parsed);
}

const HOME_SUMMARY_POLLING_INTERVAL_MS = resolveHomeSummaryPollingIntervalMs();
const HOME_METRICS_CACHE = new Map<string, { fetchedAt: number; metrics: HomeMetrics }>();

function toDataMap(value: DataValue | null | undefined): DataMap | null {
  if (!value || typeof value !== "object" || Array.isArray(value) || value instanceof Date) {
    return null;
  }
  return value;
}

function toStringValue(value: DataValue | null | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export class UsersHomePage extends BasePage<
  {},
  {
    initialized: boolean;
    isLoading: boolean;
    error?: DataValue;
    name?: string;
    modules?: UserOverviewModule[] | null;
    planTitle?: string | null;
    metrics?: HomeMetrics;
  }
> {
  protected override options = { title: `${appI18n.t("home.pageTitles.home")} | WorklyHub`, requiresAuth: true };

  private profileSub?: Subscription;
  private metricsPollingTimer: number | null = null;
  private metricsInFlight = false;
  private visibilityChangeHandler: (() => void) | null = null;

  public state = {
    isLoading: true,
    initialized: false,
    error: undefined,
    name: undefined,
    modules: undefined,
    planTitle: undefined,
    metrics: undefined,
  };

  private resolveCurrentWorkspaceId(): string | undefined {
    const ws = companyService.getWorkspaceValue();
    const workspace = toDataMap(ws);
    return toStringValue(workspace?.workspaceId) ?? toStringValue(workspace?.id);
  }

  private getMetricsCacheKey(workspaceId?: string): string {
    return workspaceId && workspaceId.trim().length > 0 ? workspaceId : "__default__";
  }

  private setupMetricsPolling(): void {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    if (this.metricsPollingTimer != null) {
      window.clearInterval(this.metricsPollingTimer);
      this.metricsPollingTimer = null;
    }
    if (this.visibilityChangeHandler) {
      document.removeEventListener("visibilitychange", this.visibilityChangeHandler);
      this.visibilityChangeHandler = null;
    }

    const refresh = async () => {
      if (document.visibilityState === "hidden") return;
      if (this.metricsInFlight) return;
      this.metricsInFlight = true;
      try {
        await this.computeAndSetMetrics();
      } finally {
        this.metricsInFlight = false;
      }
    };

    this.metricsPollingTimer = window.setInterval(
      () => void refresh(),
      HOME_SUMMARY_POLLING_INTERVAL_MS
    );
    this.visibilityChangeHandler = () => {
      if (document.visibilityState === "visible") {
        void refresh();
      }
    };
    document.addEventListener("visibilitychange", this.visibilityChangeHandler);
  }

  private async computeAndSetMetrics(opts?: { force?: boolean }): Promise<void> {
    try {
      const force = opts?.force === true;
      const schedule = new ScheduleService();
      const finance = new FinanceService();
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, "0");
      const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

      const week = new Date(now);
      week.setDate(now.getDate() + 7);
      const weekStr = `${week.getFullYear()}-${pad(week.getMonth() + 1)}-${pad(week.getDate())}`;

      const workspaceId = this.resolveCurrentWorkspaceId();
      const cacheKey = this.getMetricsCacheKey(workspaceId);

      if (!force) {
        const cached = HOME_METRICS_CACHE.get(cacheKey);
        if (cached && Date.now() - cached.fetchedAt < HOME_SUMMARY_POLLING_INTERVAL_MS) {
          this.setSafeState({ metrics: cached.metrics });
          return;
        }
      }

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

      const [
        workOrderOverviewResult,
        inventoryAlertsResult,
        notificationsSummaryResult,
      ] = await Promise.allSettled([
        workspaceId
          ? listWorkOrderOverview(workspaceId, { windowDays: 30, dueSoonHours: 24 })
          : Promise.resolve(null),
        workspaceId ? getInventoryAlerts(workspaceId) : Promise.resolve(null),
        usersNotificationsService.fetchSummary({ workspaceId }),
      ]);

      const overdueWorkOrders =
        workOrderOverviewResult.status === "fulfilled" && workOrderOverviewResult.value
          ? workOrderOverviewResult.value.totals.overdue
          : 0;

      const inventoryAlerts =
        inventoryAlertsResult.status === "fulfilled" && inventoryAlertsResult.value
          ? inventoryAlertsResult.value.summary.total
          : 0;

      const unreadNotifications =
        notificationsSummaryResult.status === "fulfilled"
          ? notificationsSummaryResult.value.summary.unreadCount
          : 0;

      const highPriorityUnreadNotifications =
        notificationsSummaryResult.status === "fulfilled"
          ? notificationsSummaryResult.value.summary.highPriorityUnreadCount
          : 0;

      const metrics: HomeMetrics = {
        appointmentsToday,
        revenueThisMonthCents,
        nextAppointment,
        overdueWorkOrders,
        inventoryAlerts,
        unreadNotifications,
        highPriorityUnreadNotifications,
      };

      HOME_METRICS_CACHE.set(cacheKey, { fetchedAt: Date.now(), metrics });

      this.setSafeState({
        metrics,
      });
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
    this.setupMetricsPolling();

    const existingOverview = usersOverviewService.getOverviewValue();
    if (existingOverview?.modules != null && existingOverview.modules.length > 0) {
      this.setSafeState({
        modules: existingOverview.modules,
        planTitle: existingOverview.profile?.planTitle ?? null,
        name: existingOverview.profile?.name ?? this.state.name,
      });
      await this.runAsync(async () => {
        try {
          await this.computeAndSetMetrics({ force: true });
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
          await this.computeAndSetMetrics({ force: true });
        } catch (e) {
          console.debug("metrics fetch failed", e);
        }
      } catch (err) {
        console.error("failed to fetch overview", err);
        message.error(appI18n.t("home.messages.failedLoadModules"));
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
    if (this.metricsPollingTimer != null && typeof window !== "undefined") {
      window.clearInterval(this.metricsPollingTimer);
      this.metricsPollingTimer = null;
    }
    if (this.visibilityChangeHandler && typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this.visibilityChangeHandler);
      this.visibilityChangeHandler = null;
    }
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
        case "sparkles":
        case "growth":
        case "megaphone":
        case "rocket":
          return <Sparkles />;
        default:
          return <Briefcase />;
      }
    };

    const services: { id: string; title: string; subtitle?: string; icon?: ReactNode; to?: string }[] = ensureGrowthModule(apiModules).map((s: UserOverviewModule) => {
      const to = resolveModulePath({ id: s.uid, title: s.name }, undefined);
      const catalogKey = resolveModuleCatalogKey(s, to);
      const localized = getLocalizedModuleCopy(s, to);

      return {
        id: catalogKey ?? s.uid,
        title: localized.title,
        subtitle: localized.description,
        icon: mapIcon(s.icon),
        to,
      };
    });

    const preferred = [
      {
        id: "work-order",
        route: "/work-order/landing",
        keywords: ["work-order", "work order", "os", "ordem", "service order"],
        fallbackIcon: <Briefcase />,
      },
      {
        id: "inventory",
        route: "/inventory/landing",
        keywords: ["inventory", "stock", "estoque", "insumo"],
        fallbackIcon: <Box />,
      },
      {
        id: "growth",
        route: "/growth/landing",
        keywords: ["growth", "autopilot", "retention", "reactivation"],
        fallbackIcon: <Sparkles />,
      },
    ];

    const selected: { id: string; title: string; subtitle?: string; icon?: ReactNode }[] = [];
    const used = new Set<string>();

    preferred.forEach((pref) => {
      const found = services.find((s) => {
        const key = normalizeText(`${s.id ?? ""} ${s.title ?? ""} ${s.subtitle ?? ""}`);
        return s.to === pref.route || key.includes(pref.id) || pref.keywords.some((k) => key.includes(normalizeText(k)));
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
      {
        id: "all-modules",
        title: appI18n.t("home.quickModules.seeAll.title"),
        subtitle: appI18n.t("home.quickModules.seeAll.subtitle"),
        icon: <LayoutGrid />,
      },
    ];

    const ws = companyService.getWorkspaceValue();
    const workspace = toDataMap(ws);
    const companyProfile = toDataMap(workspace?.company_profile);
    const companyName =
      // prefer explicit name field if present
      toStringValue(workspace?.name) ??
      // company_profile may come from API in snake_case
      toStringValue(companyProfile?.trade_name) ??
      // fallback to camelCase variants
      toStringValue(workspace?.tradeName) ??
      toStringValue(workspace?.fullName) ??
      undefined;

    const description =
      toStringValue(companyProfile?.description) ??
      toStringValue(workspace?.description) ??
      undefined;

    return (
      <UsersHomeTemplate
        name={this.state.name}
        companyName={companyName}
        description={description}
        planTitle={this.state.planTitle ?? undefined}
        services={quickModules}
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

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
