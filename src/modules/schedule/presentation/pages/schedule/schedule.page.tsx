/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { BasePage } from "@shared/base/base.page";
import type { BasePageState } from "@shared/base/interfaces/base-page.state.interface";
import { useScheduleApi, getNextSchedulesForWorkspace, getStatuses } from "@modules/schedule/services/schedule.service";
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
  categories?: import("@modules/schedule/interfaces/schedule-category.model").ScheduleCategory[] | null;
  nextSchedules?: NextScheduleItem[];
  statuses?: Array<{ id: string; code?: string; label?: string }> | null;
};

export class SchedulePage extends BasePage<BaseProps, SchedulePageState> {
  protected override options = {
    title: "Schedule | WorklyHub",
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    const ws = companyService.getWorkspaceValue() as { workspaceId?: string; id?: string } | null;
    const workspaceId = (ws?.workspaceId ?? ws?.id) as string | undefined;

    const services = this.state.services;
    const employees = this.state.employees;
    const categories = this.state.categories;
    const nextSchedules = this.state.nextSchedules;
    const statuses = this.state.statuses;

    function Wrapper(): React.ReactElement {
      const api = useScheduleApi();
      const [events, setEvents] = useState<ScheduleEvent[]>([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = React.useState<Record<string, boolean>>({});

        const categoryCounts = (() => {
        const out: Record<string, number> = {};
        const cats = (categories ?? []) as { id: string; code?: string }[];
        for (const c of cats) out[c.id] = 0;

        for (const e of events) {
          let cid: string | undefined;
          const evCat = (e as any).category;
          if (evCat && typeof evCat === 'object') {
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

      const onToggleCategory = React.useCallback((id: string, checked: boolean) => {
        try { console.debug('SchedulePage.onToggleCategory', { id, checked }); } catch (err) { console.debug(err); }
        setSelectedCategoryIds((prev) => ({ ...prev, [id]: checked }));
      }, []);

      React.useEffect(() => {
        try { console.debug('SchedulePage.selectedCategoryIds', selectedCategoryIds); } catch (err) { console.debug(err); }
      }, [selectedCategoryIds]);

      React.useEffect(() => {
        try { console.debug('SchedulePage.categoryCounts', categoryCounts); } catch (err) { console.debug(err); }
      }, [categoryCounts]);

      const filteredEvents = React.useMemo(() => {
        // if no selection provided yet, return all events
        if (!selectedCategoryIds || Object.keys(selectedCategoryIds).length === 0) return events;
        return events.filter((e) => {
          const cid = (e as any).categoryId as string | undefined;
          // show event when its category is selected (default true)
          return (cid ? (selectedCategoryIds[cid] ?? true) : true);
        });
      }, [events, selectedCategoryIds]);

      const fetchRange = React.useCallback(async (from: string, to: string) => {
        // ensure we request the full month range: first day -> last day
        const monthFrom = dayjs(from).startOf("month").format("YYYY-MM-DD");
        const monthTo = dayjs(to).endOf("month").format("YYYY-MM-DD");
        loadingService.show();
        try {
          const ev = await api.getEvents({ from: monthFrom, to: monthTo, workspaceId: workspaceId ?? null });
          console.debug("SchedulePage.fetchRange: fetched events for month", monthFrom, monthTo, ev.length, ev.map((x: any) => ({ id: x.id, date: x.date, startTime: x.startTime })));

          // normalize event.categoryId to match application categories when possible (match by code or id)
          const mapped = (ev ?? []).map((e: any) => {
            try {
              const evCat = e?.category as Record<string, any> | undefined | null;
              let appCatId: string | undefined;
              if (categories && categories.length > 0) {
                if (evCat && evCat.code) {
                  const foundByCode = (categories ?? []).find((c: any) => c.code === evCat.code);
                  if (foundByCode) appCatId = foundByCode.id;
                }
                if (!appCatId && e?.categoryId) {
                  const foundById = (categories ?? []).find((c: any) => c.id === e.categoryId);
                  if (foundById) appCatId = foundById.id;
                }
              }
              return { ...e, categoryId: appCatId ?? e.categoryId } as ScheduleEvent;
            } catch (err) {
              return e as ScheduleEvent;
            }
          });

          setEvents(mapped);
        } catch (err) {
          console.debug("SchedulePage.fetchRange error", err);
        } finally {
          loadingService.hide();
        }
      }, [api]);

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

      const handleCreate = async (draft: import("../../components/schedule-event-modal/schedule-event-modal.form.types").ScheduleEventDraft) => {
        const toCreate: Omit<import("@modules/schedule/interfaces/schedule-event.model").ScheduleEvent, "id"> & { durationMinutes?: number | null } = {
          title: draft.title,
          date: draft.date,
          startTime: draft.startTime,
          endTime: draft.endTime,
          categoryId: draft.categoryId,
          // derive categoryCode from application categories when available
          categoryCode: (categories ?? []).find((c: any) => c.id === draft.categoryId)?.code ?? (categories ?? []).find((c: any) => c.id === draft.categoryId)?.id,
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

      const handleUpdate = async (args: { id: string; event: Omit<import("@modules/schedule/interfaces/schedule-event.model").ScheduleEvent, 'id'>; serviceIds?: string[]; employeeIds?: string[]; totalPriceCents?: number; workspaceId?: string | null }) => {
        try {
          loadingService.show();
          if ((api as any).updateEvent) {
            await (api as any).updateEvent({ id: args.id, event: args.event, serviceIds: args.serviceIds, employeeIds: args.employeeIds, totalPriceCents: args.totalPriceCents, workspaceId: args.workspaceId });
          }

          // refresh current month
          const from = dayjs().startOf("month").format("YYYY-MM-DD");
          const to = dayjs().endOf("month").format("YYYY-MM-DD");
          await fetchRange(from, to);
        } catch (err) {
          console.error('handleUpdate failed', err);
        } finally {
          loadingService.hide();
        }
      };

      return <ScheduleTemplate availableServices={services} availableEmployees={employees} workspaceId={workspaceId ?? null} onCreate={handleCreate} onUpdate={handleUpdate} events={filteredEvents} onRangeChange={fetchRange} categories={categories ?? null} categoryCounts={categoryCounts} selectedCategoryIds={selectedCategoryIds} onToggleCategory={onToggleCategory} nextSchedules={nextSchedules ?? null} statuses={ (statuses ?? null) } />;
    }

    return <Wrapper />;
  }

  protected override async onInit(): Promise<void> {
    loadingService.show();
    try {
      await super.onInit?.();
      await this.runAsync(async () => {
        try {
          const services = await companyWorkspaceService.listServices();
          const employees = await peopleService.listEmployees();
          // also fetch shared application event categories and expose to template via window fallback
          try {
            const appCats = await import("@core/application/application.service").then((m) => m.applicationService.fetchEventCategories());
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
              console.debug('failed to fetch next schedules', e);
            }
          } catch (e) {
            console.debug(e);
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
              console.debug('failed to fetch next schedules', e);
            }
          }
        } catch (err) {
          console.debug(err);
        }
      });
    } finally {
      loadingService.hide();
    }
  }
}

export default SchedulePage;
