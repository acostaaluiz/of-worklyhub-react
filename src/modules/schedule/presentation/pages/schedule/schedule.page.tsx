/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import PageSkeleton from "@shared/ui/components/page-skeleton/page-skeleton.component";
import { BasePage } from "@shared/base/base.page";
import type { BasePageState } from "@shared/base/interfaces/base-page.state.interface";
import {
  useScheduleApi,
  getNextSchedulesForWorkspace,
  getStatuses,
} from "@modules/schedule/services/schedule.service";
import { ScheduleTemplate } from "../../templates/schedule/schedule.template";
import { companyWorkspaceService } from "@modules/company/services/company-workspace.service";
import { companyService } from "@modules/company/services/company.service";
import { PeopleService } from "@modules/people/services/people.service";
const peopleService = new PeopleService();
import { loadingService } from "@shared/ui/services/loading.service";
import type { CompanyServiceModel } from "@modules/company/interfaces/service.model";
import type { EmployeeModel } from "@modules/people/interfaces/employee.model";
import type {
  MonthViewHint,
  NextScheduleItem,
} from "@modules/schedule/services/schedules-api";
import dayjs from "dayjs";
import type { ScheduleEvent } from "@modules/schedule/interfaces/schedule-event.model";
import type { ScheduleCategory } from "@modules/schedule/interfaces/schedule-category.model";
import type { BaseProps } from "@shared/base/interfaces/base-props.interface";
import type { InventoryItem } from "@modules/inventory/services/inventory-api";
import { listInventoryItems } from "@modules/inventory/services/inventory.http.service";
import type { ScheduleEventDraft } from "../../components/schedule-event-modal/schedule-event-modal.form.types";
import type { InventoryItemLine } from "@modules/schedule/interfaces/schedule-event.model";

// Simple memoized fetches to avoid duplicate requests on double mount (e.g., StrictMode)
const servicesPromise = companyWorkspaceService.listServices();
const employeesPromise = peopleService.listEmployees();
const statusesPromise = getStatuses().catch(() => []);
const inventoryPromisesByWs = new Map<string, Promise<InventoryItem[]>>();
const nextByWs = new Map<string, Promise<NextScheduleItem[]>>();
const categoriesPromise = import("@core/application/application.service")
  .then((m) => m.applicationService.fetchEventCategories())
  .catch(() => null);
const initialEventsByWorkspace = new Map<string, ScheduleEvent[]>();
const initialFetchByWorkspace = new Set<string>();

function mapCategoriesWithColor(
  cats: Array<{ id: string; code?: string; label: string; color?: string | null }>
): Array<{ id: string; code?: string; label: string; color?: string }> {
  const palette = [
    "#06B6D4", // cyan
    "#A78BFA", // purple
    "#10B981", // green
    "#F59E0B", // amber
    "#F97316", // orange
    "#EF4444", // red
    "#0EA5E9", // blue
    "#7C3AED", // indigo
  ];
  const used = new Set<string>();
  return cats.map((c, idx) => {
    let chosen = c.color?.toString().trim() ?? "";
    if (!chosen || chosen.startsWith("var(")) {
      const pick = palette[idx % palette.length];
      chosen = used.has(pick) ? palette.find((p) => !used.has(p)) ?? pick : pick;
    }
    used.add(chosen);
    return { ...c, color: chosen };
  });
}

type SchedulePageState = BasePageState & {
  services?: CompanyServiceModel[];
  employees?: EmployeeModel[];
  inventoryItems?: InventoryItem[];
  categories?:
    | ScheduleCategory[]
    | null;
  nextSchedules?: NextScheduleItem[];
  statuses?: Array<{ id: string; code?: string; label?: string }> | null;
};

type EventCategoryLike = {
  id?: string;
  code?: string;
};

type EventStatusLike = {
  id?: string;
  code?: string;
};

type ScheduleEventLike = ScheduleEvent & {
  category?: EventCategoryLike | null;
  status?: EventStatusLike | null;
  statusId?: string;
};

export class SchedulePage extends BasePage<BaseProps, SchedulePageState> {
  protected override options = {
    title: "Schedule | WorklyHub",
    requiresAuth: true,
  };

  private initialized = false;

  protected override renderPage(): React.ReactNode {
    const ws = companyService.getWorkspaceValue() as {
      workspaceId?: string;
      id?: string;
    } | null;
    const workspaceId = (ws?.workspaceId ?? ws?.id) as string | undefined;

    const services = this.state.services;
    const employees = this.state.employees;
    const inventoryItems = this.state.inventoryItems;
    const categories = this.state.categories;
    const nextSchedules = this.state.nextSchedules;
    const statuses = this.state.statuses;

    function Wrapper(): React.ReactElement {
      const api = useScheduleApi();
      const [events, setEvents] = useState<ScheduleEvent[]>([]);
      const [monthViewHint, setMonthViewHint] = useState<MonthViewHint | null>(
        null
      );
      const [initialLoading, setInitialLoading] = useState<boolean>(true);
      const [selectedCategoryIds, setSelectedCategoryIds] = React.useState<
        Record<string, boolean>
      >({});
      const [selectedStatusIds, setSelectedStatusIds] = React.useState<
        Record<string, boolean>
      >({});

      const categoryCounts = (() => {
        const out: Record<string, number> = {};
        const cats = (categories ?? []) as { id: string; code?: string }[];
        for (const c of cats) out[c.id] = 0;

        for (const e of events) {
          const event = e as ScheduleEventLike;
          let cid: string | undefined;
          const evCat = event.category;
          if (evCat && typeof evCat === "object") {
            // if event category id already matches an app category, use it
            if (cats.find((c) => c.id === evCat.id)) {
              cid = evCat.id;
            } else if (evCat.code) {
              // otherwise try to match by category code (e.g. 'work')
              const match = cats.find((c) => c.code === evCat.code);
              if (match) cid = match.id;
            }
          }

          // fallback: if event provided a categoryId that matches app categories, use it
          if (!cid && event.categoryId) {
            const cidTry = event.categoryId;
            if (cats.find((c) => c.id === cidTry)) cid = cidTry;
          }

          if (!cid) continue;
          out[cid] = (out[cid] ?? 0) + 1;
        }

        return out;
      })();

      const statusCounts = (() => {
        const out: Record<string, number> = {};
        const sts = (statuses ?? []) as { id: string; code?: string }[];
        for (const s of sts) out[s.id] = 0;

        for (const e of events) {
          const event = e as ScheduleEventLike;
          let sid: string | undefined;
          const evStatus = event.status;
          if (evStatus && typeof evStatus === "object") {
            if (evStatus.id) sid = evStatus.id;
            else if (evStatus.code) {
              const match = sts.find((c) => c.code === evStatus.code);
              if (match) sid = match.id;
            }
          }

          if (!sid && event.statusId) {
            const sidTry = event.statusId;
            if (sts.find((s) => s.id === sidTry)) sid = sidTry;
          }

          if (!sid) continue;
          out[sid] = (out[sid] ?? 0) + 1;
        }

        return out;
      })();

      // ensure we have an initial selection map (all selected) when categories load
      React.useEffect(() => {
        if (!categories || (categories && categories.length === 0)) return;
        setSelectedCategoryIds((prev) => {
          // if already initialized with same keys, keep existing
          const keys = Object.keys(prev);
          if (keys.length === (categories ?? []).length) return prev;
          const map: Record<string, boolean> = {};
          for (const c of categories ?? []) map[c.id] = true;
          return map;
        });
      }, [categories?.length]);

      // ensure we have an initial selection map (all selected) when statuses load
      React.useEffect(() => {
        if (!statuses || (statuses && statuses.length === 0)) return;
        setSelectedStatusIds((prev) => {
          const keys = Object.keys(prev);
          if (keys.length === (statuses ?? []).length) return prev;
          const map: Record<string, boolean> = {};
          for (const s of statuses ?? []) map[s.id] = true;
          return map;
        });
      }, [statuses?.length]);

      const onToggleCategory = React.useCallback(
        (id: string, checked: boolean) => {
          setSelectedCategoryIds((prev) => ({ ...prev, [id]: checked }));
        },
        []
      );

      const filteredEvents = React.useMemo(() => {
        // if no selection provided yet, return all events
        const hasCategorySelection =
          selectedCategoryIds && Object.keys(selectedCategoryIds).length > 0;
        const hasStatusSelection =
          selectedStatusIds && Object.keys(selectedStatusIds).length > 0;
        if (!hasCategorySelection && !hasStatusSelection) return events;

        return events.filter((e) => {
          const event = e as ScheduleEventLike;
          // category filter
          if (hasCategorySelection) {
            const cid = event.categoryId;
            if (cid && !(selectedCategoryIds[cid] ?? true)) return false;
          }

          // status filter
          if (hasStatusSelection) {
            let sid: string | undefined;
            const evStatus = event.status;
            if (evStatus && typeof evStatus === "object") {
              if (evStatus.id) sid = evStatus.id;
              else if (evStatus.code) {
                const match = (statuses ?? []).find(
                  (c) => c.code === evStatus.code
                );
                if (match) sid = match.id;
              }
            }
            if (!sid && event.statusId) sid = event.statusId;
            if (sid && !(selectedStatusIds[sid] ?? true)) return false;
          }

          return true;
        });
      }, [events, selectedCategoryIds, selectedStatusIds, statuses]);

      const fetchRange = React.useCallback(
        async (
          from: string,
          to: string,
          options?: {
            viewMode?: "month" | "week" | "day";
            includeViewHint?: boolean;
          }
        ): Promise<ScheduleEvent[]> => {
          // ensure we request the full month range: first day -> last day
          const monthFrom = dayjs(from).startOf("month").format("YYYY-MM-DD");
          const monthTo = dayjs(to).endOf("month").format("YYYY-MM-DD");
          const viewMode = options?.viewMode ?? "month";
          const includeViewHint =
            options?.includeViewHint ?? viewMode === "month";
          try {
            const rangeResult = await api.getEventsWithHint({
              from: monthFrom,
              to: monthTo,
              workspaceId: workspaceId ?? null,
              calendarView: viewMode,
              includeViewHint,
              monthCellVisibleLimit: 2,
              monthViewTimeZone: "America/Sao_Paulo",
            });
            const ev = rangeResult.events ?? [];
            setMonthViewHint(viewMode === "month" ? rangeResult.monthViewHint : null);
            // fetched events for month

            // normalize event.categoryId to match application categories when possible (match by code or id)
            const mapped = (ev ?? []).map((e) => {
              const event = e as ScheduleEventLike;
              try {
                const evCat = event?.category;
                let appCatId: string | undefined;
                if (categories && categories.length > 0) {
                  if (evCat && evCat.code) {
                    const foundByCode = (categories ?? []).find(
                      (c) => c.code === evCat.code
                    );
                    if (foundByCode) appCatId = foundByCode.id;
                  }
                  if (!appCatId && event?.categoryId) {
                    const foundById = (categories ?? []).find(
                      (c) => c.id === event.categoryId
                    );
                    if (foundById) appCatId = foundById.id;
                  }
                }
                return {
                  ...event,
                  categoryId: appCatId ?? event.categoryId,
                } as ScheduleEvent;
              } catch (err) {
                return e as ScheduleEvent;
              }
            });

            setEvents(mapped);
            return mapped;
          } catch (err) {
            // fetchRange error
            setMonthViewHint(null);
            return [];
          }
        },
        [api]
      );

      // prevent double initial fetch when StrictMode remounts
      const initialFetchKey = workspaceId ?? "__no-ws__";
      const initialFetchDoneRef = React.useRef<boolean>(initialFetchByWorkspace.has(initialFetchKey));

      const initialFetchedRef = React.useRef(false);

      useEffect(() => {
        (async () => {
          if (initialFetchedRef.current) return;

          // if another instance already fetched for this workspace, hydrate from cache and mark bootstrapped
          if (initialFetchDoneRef.current) {
            const cached = initialEventsByWorkspace.get(initialFetchKey);
            if (cached) setEvents(cached);
            setInitialLoading(false);
            initialFetchedRef.current = true;
            return;
          }

          initialFetchedRef.current = true;
          initialFetchDoneRef.current = true;
          initialFetchByWorkspace.add(initialFetchKey);
          const from = dayjs().startOf("month").format("YYYY-MM-DD");
          const to = dayjs().endOf("month").format("YYYY-MM-DD");
          const cached = initialEventsByWorkspace.get(initialFetchKey);
          if (cached) {
            setEvents(cached);
            setInitialLoading(false);
            return;
          }
          try {
            const fetched = await fetchRange(from, to, {
              viewMode: "month",
              includeViewHint: true,
            });
            if (Array.isArray(fetched)) {
              initialEventsByWorkspace.set(initialFetchKey, fetched);
            }
          } finally {
            setInitialLoading(false);
          }
        })();
      }, [fetchRange, initialFetchKey]);

      const handleCreate = async (
        draft: ScheduleEventDraft
      ) => {
        const toCreate: Omit<
          ScheduleEvent,
          "id"
        > & { durationMinutes?: number | null } = {
          title: draft.title,
          date: draft.date,
          startTime: draft.startTime,
          endTime: draft.endTime,
          categoryId: draft.categoryId,
          // derive categoryCode from application categories when available
          categoryCode:
            (categories ?? []).find((c) => c.id === draft.categoryId)
              ?.code ??
            (categories ?? []).find((c) => c.id === draft.categoryId)?.id,
          description: draft.description,
          durationMinutes: draft.durationMinutes ?? null,
        };

        await api.createSchedule({
          event: toCreate,
          serviceIds: draft.serviceIds,
          employeeIds: draft.employeeIds,
          totalPriceCents: draft.totalPriceCents,
          inventoryInputs: draft.inventoryInputs,
          inventoryOutputs: draft.inventoryOutputs,
          workspaceId: workspaceId ?? null,
        });

        // refresh current month
        const from = dayjs().startOf("month").format("YYYY-MM-DD");
        const to = dayjs().endOf("month").format("YYYY-MM-DD");
        const refreshed = await fetchRange(from, to, {
          viewMode: "month",
          includeViewHint: true,
        });
        if (Array.isArray(refreshed)) {
          initialEventsByWorkspace.set(initialFetchKey, refreshed);
        }
        setInitialLoading(false);
      };

      const handleUpdate = async (args: {
        id: string;
        event: Omit<
          ScheduleEvent,
          "id"
        >;
        serviceIds?: string[];
        employeeIds?: string[];
        totalPriceCents?: number;
        workspaceId?: string | null;
        inventoryInputs?: InventoryItemLine[];
        inventoryOutputs?: InventoryItemLine[];
      }) => {
        try {
          loadingService.show();
          if (api.updateEvent) {
            await api.updateEvent({
              id: args.id,
              event: args.event,
              serviceIds: args.serviceIds,
              employeeIds: args.employeeIds,
              totalPriceCents: args.totalPriceCents,
              inventoryInputs: args.inventoryInputs,
              inventoryOutputs: args.inventoryOutputs,
              workspaceId: args.workspaceId,
            });
          }

          // refresh current month
          const from = dayjs().startOf("month").format("YYYY-MM-DD");
          const to = dayjs().endOf("month").format("YYYY-MM-DD");
          const refreshed = await fetchRange(from, to, {
            viewMode: "month",
            includeViewHint: true,
          });
          if (Array.isArray(refreshed)) {
            initialEventsByWorkspace.set(initialFetchKey, refreshed);
          }
          setInitialLoading(false);
        } catch (err) {
          // handleUpdate failed
        } finally {
          loadingService.hide();
        }
      };

      const categoriesReady = Array.isArray(categories) && categories.length > 0;
      const showSkeleton = initialLoading || !categoriesReady;

      return showSkeleton ? (
        <PageSkeleton mainRows={2} sideRows={2} height="100%" />
      ) : (
        <ScheduleTemplate
          availableServices={services}
          availableEmployees={employees}
          availableInventoryItems={inventoryItems}
          workspaceId={workspaceId ?? null}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          events={filteredEvents}
          onRangeChange={fetchRange}
          monthViewHint={monthViewHint}
          categories={categories ?? null}
          categoryCounts={categoryCounts}
          selectedCategoryIds={selectedCategoryIds}
          onToggleCategory={onToggleCategory}
          nextSchedules={nextSchedules ?? null}
          statuses={
            statuses
              ? statuses.map((s) => ({
                  id: String(s.id),
                  code: s.code ?? "",
                  label: s.label ?? "",
                }))
              : null
          }
          statusCounts={statusCounts}
          selectedStatusIds={selectedStatusIds}
          onToggleStatus={(id: string, checked: boolean) =>
            setSelectedStatusIds((prev) => ({ ...prev, [id]: checked }))
          }
        />
      );
    }

    return <Wrapper />;
  }

  protected override async onInit(): Promise<void> {
    if (this.initialized) return;
    await this.runAsync(async () => {
      await super.onInit?.();
      try {
        const wsVal = companyService.getWorkspaceValue() as { workspaceId?: string; id?: string } | null;
        const workspaceId = (wsVal?.workspaceId ?? wsVal?.id) as string | undefined;
        const services = await servicesPromise;
        const employees = await employeesPromise;
        let inventoryItems: InventoryItem[] = [];
        try {
          if (workspaceId) {
            const cached =
              inventoryPromisesByWs.get(workspaceId) ??
              listInventoryItems(workspaceId).catch(() => []);
            inventoryPromisesByWs.set(workspaceId, cached);
            inventoryItems = await cached;
          }
        } catch (err) {
          inventoryItems = [];
        }
        // also fetch shared application event categories and expose to template via window fallback
        try {
          const appCatsRaw = await categoriesPromise;
          const appCats = appCatsRaw
            ? mapCategoriesWithColor(appCatsRaw)
            : null;
          // also fetch statuses for schedule updates
          try {
            const sts = await statusesPromise;
            this.setSafeState({ services, employees, inventoryItems, categories: appCats ?? null, statuses: sts ?? null });
          } catch (e) {
            this.setSafeState({ services, employees, inventoryItems, categories: appCats ?? null });
          }
          try {
            const nextPromise =
              nextByWs.get(workspaceId ?? "") ??
              getNextSchedulesForWorkspace(workspaceId ?? null, 3).catch(() => []);
            nextByWs.set(workspaceId ?? "", nextPromise);
            const next = await nextPromise;
            this.setSafeState({ nextSchedules: next ?? null });
          } catch (e) {
            // failed to fetch next schedules
          }
        } catch (e) {
          // appCats import failed
          // attempt to fetch statuses even when appCats import fails
          try {
            const sts = await statusesPromise;
            this.setSafeState({ services, employees, inventoryItems, statuses: sts ?? null });
          } catch (err) {
            this.setSafeState({ services, employees, inventoryItems });
          }
          try {
            const nextPromise =
              nextByWs.get(workspaceId ?? "") ??
              getNextSchedulesForWorkspace(workspaceId ?? null, 3).catch(() => []);
            nextByWs.set(workspaceId ?? "", nextPromise);
            const next = await nextPromise;
            this.setSafeState({ nextSchedules: next ?? null });
          } catch (e) {
            // failed to fetch next schedules
          }
        }
      } catch (err) {
        // init error
      }
    }, { setLoading: true });
    this.initialized = true;
  }

  protected override renderLoading(): React.ReactNode {
    function Wrapper() {
      return <PageSkeleton mainRows={2} sideRows={2} height="100%" />;
    }

    return <Wrapper />;
  }
}

export default SchedulePage;
