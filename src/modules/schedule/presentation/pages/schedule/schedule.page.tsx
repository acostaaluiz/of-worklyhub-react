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
import type { NextScheduleItem } from "@modules/schedule/services/schedules-api";
import dayjs from "dayjs";
import type { ScheduleEvent } from "@modules/schedule/interfaces/schedule-event.model";
import type { BaseProps } from "@shared/base/interfaces/base-props.interface";

type SchedulePageState = BasePageState & {
  services?: CompanyServiceModel[];
  employees?: EmployeeModel[];
  categories?:
    | import("@modules/schedule/interfaces/schedule-category.model").ScheduleCategory[]
    | null;
  nextSchedules?: NextScheduleItem[];
  statuses?: Array<{ id: string; code?: string; label?: string }> | null;
};

export class SchedulePage extends BasePage<BaseProps, SchedulePageState> {
  protected override options = {
    title: "Schedule | WorklyHub",
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    const ws = companyService.getWorkspaceValue() as {
      workspaceId?: string;
      id?: string;
    } | null;
    const workspaceId = (ws?.workspaceId ?? ws?.id) as string | undefined;

    const services = this.state.services;
    const employees = this.state.employees;
    const categories = this.state.categories;
    const nextSchedules = this.state.nextSchedules;
    const statuses = this.state.statuses;

    function Wrapper(): React.ReactElement {
      const api = useScheduleApi();
      const [events, setEvents] = useState<ScheduleEvent[]>([]);
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
          let cid: string | undefined;
          const evCat = (e as any).category;
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
          if (!cid && (e as any).categoryId) {
            const cidTry = (e as any).categoryId as string;
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
          let sid: string | undefined;
          const evStatus = (e as any).status as
            | Record<string, any>
            | undefined
            | null;
          if (evStatus && typeof evStatus === "object") {
            if (evStatus.id) sid = evStatus.id;
            else if (evStatus.code) {
              const match = sts.find((c) => c.code === evStatus.code);
              if (match) sid = match.id;
            }
          }

          if (!sid && (e as any).statusId) {
            const sidTry = (e as any).statusId as string;
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
          // category filter
          if (hasCategorySelection) {
            const cid = (e as any).categoryId as string | undefined;
            if (cid && !(selectedCategoryIds[cid] ?? true)) return false;
          }

          // status filter
          if (hasStatusSelection) {
            let sid: string | undefined;
            const evStatus = (e as any).status as
              | Record<string, any>
              | undefined
              | null;
            if (evStatus && typeof evStatus === "object") {
              if (evStatus.id) sid = evStatus.id;
              else if (evStatus.code) {
                const match = (statuses ?? []).find(
                  (c: any) => c.code === evStatus.code
                );
                if (match) sid = match.id;
              }
            }
            if (!sid && (e as any).statusId)
              sid = (e as any).statusId as string;
            if (sid && !(selectedStatusIds[sid] ?? true)) return false;
          }

          return true;
        });
      }, [events, selectedCategoryIds, selectedStatusIds, statuses]);

      const fetchRange = React.useCallback(
        async (from: string, to: string) => {
          // ensure we request the full month range: first day -> last day
          const monthFrom = dayjs(from).startOf("month").format("YYYY-MM-DD");
          const monthTo = dayjs(to).endOf("month").format("YYYY-MM-DD");
          try {
            const ev = await api.getEvents({
              from: monthFrom,
              to: monthTo,
              workspaceId: workspaceId ?? null,
            });
            // fetched events for month

            // normalize event.categoryId to match application categories when possible (match by code or id)
            const mapped = (ev ?? []).map((e: any) => {
              try {
                const evCat = e?.category as
                  | Record<string, any>
                  | undefined
                  | null;
                let appCatId: string | undefined;
                if (categories && categories.length > 0) {
                  if (evCat && evCat.code) {
                    const foundByCode = (categories ?? []).find(
                      (c: any) => c.code === evCat.code
                    );
                    if (foundByCode) appCatId = foundByCode.id;
                  }
                  if (!appCatId && e?.categoryId) {
                    const foundById = (categories ?? []).find(
                      (c: any) => c.id === e.categoryId
                    );
                    if (foundById) appCatId = foundById.id;
                  }
                }
                return {
                  ...e,
                  categoryId: appCatId ?? e.categoryId,
                } as ScheduleEvent;
              } catch (err) {
                return e as ScheduleEvent;
              }
            });

            setEvents(mapped);
          } catch (err) {
            // fetchRange error
          }
        },
        [api]
      );

      const initialFetchedRef = React.useRef(false);

      useEffect(() => {
        (async () => {
          if (initialFetchedRef.current) return;
          initialFetchedRef.current = true;
          const from = dayjs().startOf("month").format("YYYY-MM-DD");
          const to = dayjs().endOf("month").format("YYYY-MM-DD");
          await fetchRange(from, to);
        })();
      }, [fetchRange]);

      const handleCreate = async (
        draft: import("../../components/schedule-event-modal/schedule-event-modal.form.types").ScheduleEventDraft
      ) => {
        const toCreate: Omit<
          import("@modules/schedule/interfaces/schedule-event.model").ScheduleEvent,
          "id"
        > & { durationMinutes?: number | null } = {
          title: draft.title,
          date: draft.date,
          startTime: draft.startTime,
          endTime: draft.endTime,
          categoryId: draft.categoryId,
          // derive categoryCode from application categories when available
          categoryCode:
            (categories ?? []).find((c: any) => c.id === draft.categoryId)
              ?.code ??
            (categories ?? []).find((c: any) => c.id === draft.categoryId)?.id,
          description: draft.description,
          durationMinutes: draft.durationMinutes ?? null,
        };

        await api.createSchedule({
          event: toCreate,
          serviceIds: draft.serviceIds,
          employeeIds: draft.employeeIds,
          totalPriceCents: draft.totalPriceCents,
          workspaceId: workspaceId ?? null,
        });

        // refresh current month
        const from = dayjs().startOf("month").format("YYYY-MM-DD");
        const to = dayjs().endOf("month").format("YYYY-MM-DD");
        await fetchRange(from, to);
      };

      const handleUpdate = async (args: {
        id: string;
        event: Omit<
          import("@modules/schedule/interfaces/schedule-event.model").ScheduleEvent,
          "id"
        >;
        serviceIds?: string[];
        employeeIds?: string[];
        totalPriceCents?: number;
        workspaceId?: string | null;
      }) => {
        try {
          loadingService.show();
          if ((api as any).updateEvent) {
            await (api as any).updateEvent({
              id: args.id,
              event: args.event,
              serviceIds: args.serviceIds,
              employeeIds: args.employeeIds,
              totalPriceCents: args.totalPriceCents,
              workspaceId: args.workspaceId,
            });
          }

          // refresh current month
          const from = dayjs().startOf("month").format("YYYY-MM-DD");
          const to = dayjs().endOf("month").format("YYYY-MM-DD");
          await fetchRange(from, to);
        } catch (err) {
          // handleUpdate failed
        } finally {
          loadingService.hide();
        }
      };

      return (
        <ScheduleTemplate
          availableServices={services}
          availableEmployees={employees}
          workspaceId={workspaceId ?? null}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          events={filteredEvents}
          onRangeChange={fetchRange}
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
    await this.runAsync(async () => {
      await super.onInit?.();
      try {
        const services = await companyWorkspaceService.listServices();
        const employees = await peopleService.listEmployees();
        // also fetch shared application event categories and expose to template via window fallback
        try {
          const appCats = await import("@core/application/application.service").then((m) =>
            m.applicationService.fetchEventCategories()
          );
          // also fetch statuses for schedule updates
          try {
            const sts = await getStatuses();
            this.setSafeState({ services, employees, categories: appCats ?? null, statuses: sts ?? null });
          } catch (e) {
            this.setSafeState({ services, employees, categories: appCats ?? null });
          }
          try {
            const ws = companyService.getWorkspaceValue() as { workspaceId?: string; id?: string } | null;
            const workspaceId = (ws?.workspaceId ?? ws?.id) as string | undefined;
            const next = await getNextSchedulesForWorkspace(workspaceId ?? null, 3);
            this.setSafeState({ nextSchedules: next ?? null });
          } catch (e) {
            // failed to fetch next schedules
          }
        } catch (e) {
          // appCats import failed
          // attempt to fetch statuses even when appCats import fails
          try {
            const sts = await getStatuses();
            this.setSafeState({ services, employees, statuses: sts ?? null });
          } catch (err) {
            this.setSafeState({ services, employees });
          }
          try {
            const ws = companyService.getWorkspaceValue() as { workspaceId?: string; id?: string } | null;
            const workspaceId = (ws?.workspaceId ?? ws?.id) as string | undefined;
            const next = await getNextSchedulesForWorkspace(workspaceId ?? null, 3);
            this.setSafeState({ nextSchedules: next ?? null });
          } catch (e) {
            // failed to fetch next schedules
          }
        }
      } catch (err) {
        // init error
      }
    }, { setLoading: true });
  }

  protected override renderLoading(): React.ReactNode {
    function Wrapper() {
      return <PageSkeleton mainRows={2} sideRows={2} height="100%" />;
    }

    return <Wrapper />;
  }
}

export default SchedulePage;
