import React, { useEffect, useState } from "react";
import { BasePage } from "@shared/base/base.page";
import type { BasePageState } from "@shared/base/interfaces/base-page.state.interface";
import { useScheduleApi } from "@modules/schedule/services/schedule.service";
import { ScheduleTemplate } from "../../templates/schedule/schedule.template";
import { companyWorkspaceService } from "@modules/company/services/company-workspace.service";
import { companyService } from "@modules/company/services/company.service";
import { PeopleService } from "@modules/people/services/people.service";
const peopleService = new PeopleService();
import type { CompanyServiceModel } from "@modules/company/interfaces/service.model";
import type { EmployeeModel } from "@modules/people/interfaces/employee.model";
import dayjs from "dayjs";
import type { ScheduleEvent } from "@modules/schedule/interfaces/schedule-event.model";
import type { BaseProps } from "@shared/base/interfaces/base-props.interface";

type SchedulePageState = BasePageState & {
  services?: CompanyServiceModel[];
  employees?: EmployeeModel[];
  categories?: import("@modules/schedule/interfaces/schedule-category.model").ScheduleCategory[] | null;
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

    function Wrapper(): React.ReactElement {
      const api = useScheduleApi();
      const [events, setEvents] = useState<ScheduleEvent[]>([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = React.useState<Record<string, boolean>>({});

      const categoryCounts = React.useMemo(() => {
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
      }, [events, categories]);

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
      }, [categories]);

      const onToggleCategory = React.useCallback((id: string, checked: boolean) => {
        setSelectedCategoryIds((prev) => ({ ...prev, [id]: checked }));
      }, []);

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
      }, [api, workspaceId]);

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

      return <ScheduleTemplate availableServices={services} availableEmployees={employees} workspaceId={workspaceId ?? null} onCreate={handleCreate} events={filteredEvents} onRangeChange={fetchRange} categories={categories ?? null} categoryCounts={categoryCounts} selectedCategoryIds={selectedCategoryIds} onToggleCategory={onToggleCategory} />;
    }

    return <Wrapper />;
  }

  protected override async onInit(): Promise<void> {
    await super.onInit?.();
    await this.runAsync(async () => {
      try {
        const services = await companyWorkspaceService.listServices();
        const employees = await peopleService.listEmployees();
        // also fetch shared application event categories and expose to template via window fallback
        try {
          const appCats = await import("@core/application/application.service").then(m => m.applicationService.fetchEventCategories());
          this.setSafeState({ services, employees, categories: appCats ?? null });
        } catch (e) {
          console.debug(e);
          this.setSafeState({ services, employees });
        }
      } catch (err) {
        console.debug(err);
      }
    });
  }
}

export default SchedulePage;
