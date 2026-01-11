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
  categories?: import("@modules/schedule/interfaces/schedule-category.model").ScheduleCategory[] | null;
  categoryCounts?: Record<string, number> | null;
  selectedCategoryIds?: Record<string, boolean> | null;
  onToggleCategory?: (id: string, checked: boolean) => void;
};

export function ScheduleSidebar(props: ScheduleSidebarProps) {
  const api = useScheduleApi();
  const [categories, setCategories] = useState<ScheduleCategory[]>([]);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);

  const [selectedDate, _setSelectedDate] = useState<Dayjs>(dayjs());
  // local fallback selection used only when parent does not provide control
  const [localCategorySelection, setLocalCategorySelection] = useState<
    Record<string, boolean>
  >({});

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    (async () => {
      // prefer categories passed from page (fetched from application service)
      if (props.categories && Array.isArray(props.categories)) {
        // map incoming categories to include a display color when missing
        const codeColorMap: Record<string, string> = {
          work: "var(--color-primary)",
          personal: "var(--color-secondary)",
          schedule: "var(--color-tertiary)",
          gaming: "rgba(233, 171, 19, 0.95)",
        };
        const mapped = props.categories.map((c) => {
          const code = c.code ?? "";
          return { id: c.id, code, label: c.label, color: c.color ?? codeColorMap[code] ?? "var(--color-primary)" };
        });
        setCategories(mapped);
      } else {
        const cats = await api.getCategories();
        setCategories(cats);
      }
    })();
  }, [api, props.categories]);

  const countsByCategory = useMemo(() => {
    // if page provided counts, prefer them (ensure keys exist for categories)
    if (props.categoryCounts && Object.keys(props.categoryCounts).length > 0) {
      const out: Record<string, number> = {};
      for (const c of categories) out[c.id] = props.categoryCounts[c.id] ?? 0;
      return out;
    }

    const counts: Record<string, number> = {};
    for (const c of categories) counts[c.id] = 0;
    for (const e of events) counts[e.categoryId] = (counts[e.categoryId] ?? 0) + 1;
    return counts;
  }, [categories, events, props.categoryCounts]);
  const onToggleCategory = (id: string, checked: boolean) => {
    if (props.onToggleCategory) {
      props.onToggleCategory(id, checked);
      return;
    }

    setLocalCategorySelection((prev) => ({ ...prev, [id]: checked }));
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
          <div className="label">Categories</div>
          <Button size="small">Edit</Button>
        </BlockHeader>

        <List>
          {categories.map((c) => (
            <CategoryRow key={c.id} $color={c.color}>
              <div className="left">
                <Checkbox
                  checked={(props.selectedCategoryIds?.[c.id] ?? localCategorySelection[c.id]) ?? true}
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
