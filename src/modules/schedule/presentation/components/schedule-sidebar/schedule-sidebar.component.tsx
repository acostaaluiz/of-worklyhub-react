import { useEffect, useMemo, useState } from "react";
import { Button, Checkbox } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { Plus } from "lucide-react";

import { useScheduleApi } from "../../../services/schedule.service";

import {
  categoryColorMap,
  getStatusColor,
  getCategoryColor,
} from "../../../constants/colors";

import {
  SidebarHeaderRow,
  SidebarTitle,
  Block,
  BlockHeader,
  List,
  NextBlock,
  NextCard,
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
  onCreate?: (
    draft: import("../schedule-event-modal/schedule-event-modal.form.types").ScheduleEventDraft
  ) => Promise<void>;
  categories?:
    | import("@modules/schedule/interfaces/schedule-category.model").ScheduleCategory[]
    | null;
  categoryCounts?: Record<string, number> | null;
  selectedCategoryIds?: Record<string, boolean> | null;
  onToggleCategory?: (id: string, checked: boolean) => void;
  nextSchedules?:
    | import("@modules/schedule/services/schedules-api").NextScheduleItem[]
    | null;
  statuses?:
    | import("@modules/schedule/services/schedules-api").ScheduleStatus[]
    | null;
  statusCounts?: Record<string, number> | null;
  selectedStatusIds?: Record<string, boolean> | null;
  onToggleStatus?: (id: string, checked: boolean) => void;
};

export function ScheduleSidebar(props: ScheduleSidebarProps) {
  const api = useScheduleApi();
  // deterministic color from id to avoid duplicates when no explicit color provided
  const colorFromId = (id: string, idx: number) => {
    let h = 0;
    for (let i = 0; i < id.length; i++) {
      h = (h << 5) - h + id.charCodeAt(i);
      h = h & h;
    }
    const hue = Math.abs(h) % 360;
    const sat = 64 + ((idx * 11) % 20); // vary saturation slightly by index
    const light = 48 + ((idx * 7) % 6);
    return `hsl(${hue} ${sat}% ${light}%)`;
  };

  const [categories, setCategories] = useState<ScheduleCategory[]>([]);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);

  const [localStatusSelection, setLocalStatusSelection] = useState<
    Record<string, boolean>
  >({});

  const [selectedDate, _setSelectedDate] = useState<Dayjs>(dayjs());
  // local fallback selection used only when parent does not provide control
  const [localCategorySelection, setLocalCategorySelection] = useState<
    Record<string, boolean>
  >({});

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const nextSchedules = props.nextSchedules ?? null;

  useEffect(() => {
    (async () => {
      // prefer categories passed from page (fetched from application service)
      if (props.categories && Array.isArray(props.categories)) {
        // map incoming categories to include a display color when missing
        const codeColorMap: Record<string, string> = categoryColorMap;
        // explicit palette of contrasting colors to avoid near-duplicates
        const palette = [
          "#F59E0B", // amber
          "#06B6D4", // cyan
          "#A78BFA", // purple
          "#10B981", // green
          "#F97316", // orange
          "#EF4444", // red
          "#0EA5E9", // blue
          "#7C3AED",
        ];

        const used = new Set<string>();
        const mapped = props.categories.map((c, idx) => {
          const code = c.code ?? "";
          // try to use explicit color only when it's a concrete color (not var(...))
          let chosen: string | undefined;
          const explicit = c.color?.toString()?.trim();
          if (explicit && !explicit.startsWith("var(")) chosen = explicit;

          // next try code map if it provides a concrete color
          const mappedByCode = getCategoryColor(code) ?? codeColorMap[code];
          if (!chosen && mappedByCode && !mappedByCode.startsWith("var("))
            chosen = mappedByCode;

          // otherwise pick from palette
          if (!chosen) chosen = palette[idx % palette.length];

          // ensure uniqueness: prefer palette/free generated color if collision
          if (used.has(chosen)) {
            // try find unused in palette
            const found = palette.find((p) => !used.has(p));
            if (found) chosen = found;
            else chosen = colorFromId(c.id, idx);
          }

          used.add(chosen);
          return { id: c.id, code, label: c.label, color: chosen };
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
    for (const e of events)
      counts[e.categoryId] = (counts[e.categoryId] ?? 0) + 1;
    return counts;
  }, [categories, events, props.categoryCounts]);
  const onToggleCategory = (id: string, checked: boolean) => {
    // toggle category selection
    if (props.onToggleCategory) {
      props.onToggleCategory(id, checked);
      return;
    }

    setLocalCategorySelection((prev) => ({ ...prev, [id]: checked }));
  };

  const onToggleStatus = (id: string, checked: boolean) => {
    if (props.onToggleStatus) {
      props.onToggleStatus(id, checked);
      return;
    }
    setLocalStatusSelection((prev) => ({ ...prev, [id]: checked }));
  };

  const handleCreate = async (payload: ScheduleEventDraft) => {
    if (props.onCreate) {
      await props.onCreate(payload);
    } else {
      const toCreate: Omit<ScheduleEvent, "id"> & {
        durationMinutes?: number | null;
      } = {
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
            <CategoryRow key={c.id} $color={c.color ?? "var(--color-surface)"}>
              <div className="left">
                <Checkbox
                  checked={
                    props.selectedCategoryIds?.[c.id] ??
                    localCategorySelection[c.id] ??
                    true
                  }
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

      <div style={{ height: 10 }} />

      <Block>
        <BlockHeader>
          <div className="label">Statuses</div>
        </BlockHeader>

        <List>
          {(props.statuses ?? []).map((s, idx) => (
            <CategoryRow
              key={s.id}
              $color={getStatusColor(s.code) ?? colorFromId(s.id, idx)}
            >
              <div className="left">
                <Checkbox
                  checked={
                    props.selectedStatusIds?.[s.id] ??
                    localStatusSelection[s.id] ??
                    true
                  }
                  onChange={(e) => onToggleStatus(s.id, e.target.checked)}
                />
                <span className="dot" />
                <span className="name">{s.label}</span>
              </div>
              <span className="count">{props.statusCounts?.[s.id] ?? 0}</span>
            </CategoryRow>
          ))}
        </List>
      </Block>

      {nextSchedules && nextSchedules.length > 0 ? (
        <NextBlock>
          <BlockHeader>
            <div className="label">Next events</div>
          </BlockHeader>
          <List>
            {nextSchedules.map((n) => (
              <NextCard key={n.id}>
                <div className="time">{dayjs(n.start).format("HH:mm")}</div>
                <div className="title">{n.title ?? "Untitled"}</div>
                <div className="meta">
                  {n.startsIn ?? `${n.startsInMinutes} minutes`}
                </div>
              </NextCard>
            ))}
          </List>
        </NextBlock>
      ) : null}

      <ScheduleEventModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        categories={categories.map((c) => ({
          id: c.id,
          label: c.label,
          color: c.color ?? "var(--color-surface)",
        }))}
        initialDate={selectedDate.format("YYYY-MM-DD")}
        onConfirm={handleCreate}
        availableServices={props.availableServices}
        availableEmployees={props.availableEmployees}
      />
    </div>
  );
}
