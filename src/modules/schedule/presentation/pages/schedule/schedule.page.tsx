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

    function Wrapper(): React.ReactElement {
      const api = useScheduleApi();
      const [events, setEvents] = useState<ScheduleEvent[]>([]);

      const fetchRange = React.useCallback(async (from: string, to: string) => {
        // ensure we request the full month range: first day -> last day
        const monthFrom = dayjs(from).startOf("month").format("YYYY-MM-DD");
        const monthTo = dayjs(to).endOf("month").format("YYYY-MM-DD");
        const ev = await api.getEvents({ from: monthFrom, to: monthTo, workspaceId: workspaceId ?? null });
        console.debug("SchedulePage.fetchRange: fetched events for month", monthFrom, monthTo, ev.length, ev.map((x: any) => ({ id: x.id, date: x.date, startTime: x.startTime })));
        setEvents(ev);
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

      return <ScheduleTemplate availableServices={services} availableEmployees={employees} workspaceId={workspaceId ?? null} onCreate={handleCreate} events={events} onRangeChange={fetchRange} />;
    }

    return <Wrapper />;
  }

  protected override async onInit(): Promise<void> {
    await super.onInit?.();
    await this.runAsync(async () => {
      try {
        const services = await companyWorkspaceService.listServices();
        const employees = await peopleService.listEmployees();
        this.setSafeState({ services, employees });
      } catch (err) {
        console.debug(err);
      }
    });
  }
}

export default SchedulePage;
