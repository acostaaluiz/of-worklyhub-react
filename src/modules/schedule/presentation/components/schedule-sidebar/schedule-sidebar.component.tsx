import { useEffect, useMemo, useState } from "react";
import { Button, Checkbox } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { Plus } from "lucide-react";

import { useScheduleApi } from "../../../services/schedule.service";

import {
  SidebarHeaderRow,
  SidebarTitle,
  Block,
  BlockHeader,
  List,
  CategoryRow,
} from "./schedule-sidebar.component.styles";
import type { ScheduleCategory } from "@modules/schedule/interfaces/schedule-category.model";
import type { ScheduleEvent } from "@modules/schedule/interfaces/schedule-event.model";
import { ScheduleEventModal } from "../schedule-event-modal/schedule-event-modal.component";
import type { ScheduleEventDraft } from "../schedule-event-modal/schedule-event-modal.form.types";


type ScheduleSidebarProps = {
  availableServices?: import("@modules/company/interfaces/service.model").CompanyServiceModel[];
  availableEmployees?: import("@modules/people/interfaces/employee.model").EmployeeModel[];
  workspaceId?: string | null;
  onCreate?: (draft: import("../schedule-event-modal/schedule-event-modal.form.types").ScheduleEventDraft) => Promise<void>;
};

export function ScheduleSidebar(props: ScheduleSidebarProps) {
  const api = useScheduleApi();
  const [categories, setCategories] = useState<ScheduleCategory[]>([]);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);

  const [selectedDate, _setSelectedDate] = useState<Dayjs>(dayjs());
  const [categorySelection, setCategorySelection] = useState<
    Record<string, boolean>
  >({
    work: true,
    personal: true,
    schedule: true,
    gaming: true,
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const cats = await api.getCategories();
      setCategories(cats);

      // sidebar counts: use current month (simple approach)
      const start = selectedDate.startOf("month").format("YYYY-MM-DD");
      const end = selectedDate.endOf("month").format("YYYY-MM-DD");
      const ev = await api.getEvents({ from: start, to: end });
      setEvents(ev);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const countsByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of categories) counts[c.id] = 0;
    for (const e of events)
      counts[e.categoryId] = (counts[e.categoryId] ?? 0) + 1;
    return counts;
  }, [categories, events]);

  const schedulesList = useMemo(
    () => [
      { key: "daily-standup", label: "Daily Standup" },
      { key: "weekly-review", label: "Weekly Review" },
      { key: "team-meeting", label: "Team Meeting" },
      { key: "lunch-break", label: "Lunch Break" },
      { key: "client-meeting", label: "Client Meeting" },
      { key: "other", label: "Other" },
    ],
    []
  );



  const onToggleCategory = (id: string, checked: boolean) => {
    setCategorySelection((prev) => ({ ...prev, [id]: checked }));
  };

  const handleCreate = async (payload: ScheduleEventDraft) => {
    if (props.onCreate) {
      await props.onCreate(payload);
    } else {
      const toCreate: Omit<ScheduleEvent, "id"> & { durationMinutes?: number | null } = {
        title: payload.title,
        date: payload.date,
        startTime: payload.startTime,
        endTime: payload.endTime,
        categoryId: payload.categoryId,
        description: payload.description,
        durationMinutes: payload.durationMinutes ?? null,
      };

      await api.createSchedule({
        event: toCreate,
        serviceIds: payload.serviceIds,
        employeeIds: payload.employeeIds,
        totalPriceCents: payload.totalPriceCents,
        workspaceId: props.workspaceId ?? null,
      });
    }

    const start = selectedDate.startOf("month").format("YYYY-MM-DD");
    const end = selectedDate.endOf("month").format("YYYY-MM-DD");
    const ev = await api.getEvents({ from: start, to: end });

    setEvents(ev);
    setIsCreateOpen(false);
  };

  return (
    <div>
      <SidebarHeaderRow>
        <SidebarTitle>
          <div className="title">My Calendar</div>
          <div className="subtitle">Personal, teams</div>
        </SidebarTitle>

        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={() => setIsCreateOpen(true)}
        >
          New
        </Button>
      </SidebarHeaderRow>

      <div style={{ height: 14 }} />

      <Block>
        <BlockHeader>
          <div className="label">My Schedules</div>
          <Button size="small">+</Button>
        </BlockHeader>

        <List>
          {schedulesList.map((item) => (
            <Checkbox key={item.key} defaultChecked>
              {item.label}
            </Checkbox>
          ))}
        </List>
      </Block>

      <div style={{ height: 14 }} />

      <Block>
        <BlockHeader>
          <div className="label">Categories</div>
          <Button size="small">Edit</Button>
        </BlockHeader>

        <List>
          {categories.map((c) => (
            <CategoryRow key={c.id} $color={c.color}>
              <div className="left">
                <Checkbox
                  checked={categorySelection[c.id] ?? true}
                  onChange={(e) => onToggleCategory(c.id, e.target.checked)}
                />
                <span className="dot" />
                <span className="name">{c.label}</span>
              </div>
              <span className="count">{countsByCategory[c.id] ?? 0}</span>
            </CategoryRow>
          ))}
        </List>
      </Block>

      <ScheduleEventModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        categories={categories}
        initialDate={selectedDate.format("YYYY-MM-DD")}
        onConfirm={handleCreate}
        availableServices={props.availableServices}
        availableEmployees={props.availableEmployees}
      />
    </div>
  );
}
