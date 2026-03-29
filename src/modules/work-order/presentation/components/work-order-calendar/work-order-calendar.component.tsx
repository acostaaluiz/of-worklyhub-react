import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Input, Segmented, Typography } from "antd";
import dayjs from "dayjs";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";

import Calendar from "@toast-ui/calendar";
import type { EventObject } from "@toast-ui/calendar";

import type {
  WorkOrder,
  WorkOrderStatus,
} from "@modules/work-order/interfaces/work-order.model";
import { i18n as appI18n } from "@core/i18n";
import {
  CalendarShell,
  ToolbarRow,
  CalendarWrap,
  CalendarHost,
  ToastUIGlobalStyles,
} from "./work-order-calendar.component.styles";

type Props = {
  orders: WorkOrder[];
  statuses?: WorkOrderStatus[];
  loading?: boolean;
  onRangeChange?: (from: string, to: string) => Promise<void>;
};

type CalendarViewMode = "month" | "week" | "day";

type CalendarDefinition = {
  id: string;
  name: string;
  backgroundColor: string;
  borderColor: string;
  color: string;
};

type CalendarInstance = Calendar & {
  render?: () => void;
  createEvents?: (events: EventObject[]) => void;
  setDate?: (date: Date) => void;
  options?: {
    events?: EventObject[];
  };
};

const statusColorMap: Record<string, string> = {
  opened: "#f59e0b",
  work_in_progress: "#2563eb",
  completed: "#16a34a",
  canceled: "#ef4444",
};

const statusPalette = [
  "#0ea5e9",
  "#f59e0b",
  "#10b981",
  "#a78bfa",
  "#f97316",
  "#ef4444",
];

const defaultColor = "#1e70ff";

function resolveDateRange(order: WorkOrder): { start: Date; end: Date } | null {
  const startRaw =
    order.scheduledStartAt ??
    order.scheduledEndAt ??
    order.dueAt ??
    order.createdAt ??
    null;
  if (!startRaw) return null;

  const start = dayjs(startRaw);
  if (!start.isValid()) return null;

  let end = order.scheduledEndAt ? dayjs(order.scheduledEndAt) : null;
  if (!end || !end.isValid()) {
    const duration =
      typeof order.estimatedDurationMinutes === "number"
        ? order.estimatedDurationMinutes
        : 60;
    end = start.add(Math.max(duration, 30), "minute");
  }

  if (end.isBefore(start)) {
    end = start.add(60, "minute");
  }

  return { start: start.toDate(), end: end.toDate() };
}

function buildCalendarOptions(args: {
  viewMode: CalendarViewMode;
  calendars: CalendarDefinition[];
  events: EventObject[];
}) {
  return {
    height: "100%",
    defaultView: args.viewMode,
    calendars: args.calendars,
    events: args.events,
    usageStatistics: false,
    useDetailPopup: true,
    useFormPopup: false,
    isReadOnly: true,
    month: {
      startDayOfWeek: 0,
      visibleWeeksCount: 0,
      isAlways6Weeks: false,
    },
  };
}

export function WorkOrderCalendar({
  orders,
  statuses,
  loading,
  onRangeChange,
}: Props) {
        const wrapRef = useRef<HTMLDivElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<CalendarInstance | null>(null);

  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [headerLabel, setHeaderLabel] = useState<string>(
    dayjs().format("MMMM YYYY")
  );
  const [search, setSearch] = useState<string>("");

  const statusColorsById = useMemo(() => {
    const map = new Map<string, string>();
    (statuses ?? []).forEach((s, idx) => {
      const color = statusColorMap[s.code] ?? statusPalette[idx % statusPalette.length];
      map.set(String(s.id), color);
    });
    return map;
  }, [statuses]);

  const calendars = useMemo<CalendarDefinition[]>(() => {
    const base: CalendarDefinition[] = [
      {
        id: "default",
        name: appI18n.t("legacyInline.work_order.presentation_components_work_order_calendar_work_order_calendar_component.k001"),
        backgroundColor: defaultColor,
        borderColor: defaultColor,
        color: "#ffffff",
      },
    ];

    if (statuses && statuses.length > 0) {
      const mapped = statuses.map((status, idx) => {
        const color = statusColorMap[status.code] ?? statusPalette[idx % statusPalette.length];
        return {
          id: String(status.id),
          name: status.label,
          backgroundColor: color,
          borderColor: color,
          color: "#ffffff",
        };
      });
      return [...mapped, ...base];
    }

    return base;
  }, [statuses]);

  const resolvePriorityLabel = useMemo(
    () => (priority?: WorkOrder["priority"]) => {
      if (priority === "low") return appI18n.t("legacyInline.work_order.presentation_components_work_order_calendar_work_order_calendar_component.k002");
      if (priority === "medium") return appI18n.t("legacyInline.work_order.presentation_components_work_order_calendar_work_order_calendar_component.k003");
      if (priority === "high") return appI18n.t("legacyInline.work_order.presentation_components_work_order_calendar_work_order_calendar_component.k004");
      if (priority === "urgent") return appI18n.t("legacyInline.work_order.presentation_components_work_order_calendar_work_order_calendar_component.k005");
      return "--";
    },
    []
  );

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return orders;

    return orders.filter((order) => {
      const title = order.title.toLowerCase();
      const description = (order.description ?? "").toLowerCase();
      return title.includes(query) || description.includes(query);
    });
  }, [orders, search]);

  const tuiEvents = useMemo<EventObject[]>(() => {
    const out: EventObject[] = [];

    filteredOrders.forEach((order) => {
      const range = resolveDateRange(order);
      if (!range) return;

      const rawStatusId = order.status?.id ? String(order.status.id) : "default";
      const hasStatusCalendar = statusColorsById.size > 0;
      const statusId =
        hasStatusCalendar && statusColorsById.has(rawStatusId)
          ? rawStatusId
          : "default";
      const statusColor =
        (order.status?.code && statusColorMap[order.status.code]) ||
        statusColorsById.get(rawStatusId) ||
        defaultColor;

      const detailText = [
        order.description?.trim(),
        `${appI18n.t("legacyInline.work_order.presentation_components_work_order_calendar_work_order_calendar_component.k006")}: ${resolvePriorityLabel(order.priority)}`,
      ]
        .filter(Boolean)
        .join(" - ");

      out.push({
        id: order.id,
        calendarId: statusId,
        title: order.title,
        category: "time",
        start: range.start,
        end: range.end,
        backgroundColor: statusColor,
        borderColor: statusColor,
        color: "#ffffff",
        body: detailText,
        raw: {
          workOrderId: order.id,
          status: order.status,
          priority: order.priority,
        },
      } as EventObject);
    });

    return out;
  }, [filteredOrders, statusColorsById, resolvePriorityLabel]);

  const refreshHeaderLabel = () => {
    const inst = instanceRef.current;
    const date = inst?.getDate?.();
    if (!date) return;
    setHeaderLabel(dayjs(date).format("MMMM YYYY"));
  };

  const loadMonthRange = async () => {
    const inst = instanceRef.current;
    if (!inst || !onRangeChange) return;
    const date = inst.getDate?.();
    if (!date) return;
    const from = dayjs(date).startOf("month").format("YYYY-MM-DD");
    const to = dayjs(date).endOf("month").format("YYYY-MM-DD");
    await onRangeChange(from, to);
  };

  const syncHostHeight = () => {
    const wrap = wrapRef.current;
    const host = hostRef.current;
    if (!wrap || !host) return;
    const rect = wrap.getBoundingClientRect();
    if (rect.height > 0) {
      host.style.height = `${Math.floor(rect.height)}px`;
    }
  };

  const handlePrev = async () => {
    const inst = instanceRef.current;
    if (!inst) return;
    inst.prev();
    refreshHeaderLabel();
    await loadMonthRange();
  };

  const handleNext = async () => {
    const inst = instanceRef.current;
    if (!inst) return;
    inst.next();
    refreshHeaderLabel();
    await loadMonthRange();
  };

  const handleToday = async () => {
    const inst = instanceRef.current;
    if (!inst) return;
    inst.today();
    refreshHeaderLabel();
    await loadMonthRange();
  };

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    syncHostHeight();

    const previousDate = instanceRef.current?.getDate?.();
    instanceRef.current?.destroy?.();

    const inst = new Calendar(
      host,
      buildCalendarOptions({
        viewMode,
        calendars,
        events: [],
      })
    ) as CalendarInstance;

    instanceRef.current = inst;

    if (previousDate) {
      inst.setDate?.(previousDate);
    }

    refreshHeaderLabel();

    const handleResize = () => syncHostHeight();
    window.addEventListener("resize", handleResize);

    return () => {
      inst.destroy?.();
      instanceRef.current = null;
      window.removeEventListener("resize", handleResize);
    };
  }, [viewMode, calendars]);

  useEffect(() => {
    const inst = instanceRef.current;
    if (!inst) return;

    try {
      if (typeof inst.clear === "function" && typeof inst.createEvents === "function") {
        inst.clear();
        if (tuiEvents.length > 0) inst.createEvents(tuiEvents);
        inst.render?.();
        refreshHeaderLabel();
      } else {
        if (inst.options) {
          inst.options.events = tuiEvents;
        }
        inst.render?.();
      }
    } catch (error) {
      void error;
    }
  }, [tuiEvents]);

  const isMobileViewport =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 768px)").matches;

  return (
    <>
      <ToastUIGlobalStyles />
      <CalendarShell>
        <ToolbarRow style={{ flexDirection: "column", alignItems: "stretch" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: isMobileViewport ? "stretch" : "center",
              flexDirection: isMobileViewport ? "column" : "row",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CalendarIcon size={20} />
              <Typography.Title level={3} style={{ margin: 0 }}>
                {headerLabel}
              </Typography.Title>
              {loading ? (
                <Typography.Text type="secondary" style={{ marginLeft: 8 }}>
                  {appI18n.t("legacyInline.work_order.presentation_components_work_order_calendar_work_order_calendar_component.k007")}
                </Typography.Text>
              ) : null}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                width: isMobileViewport ? "100%" : "auto",
              }}
            >
              <Input
                value={search}
                onChange={(ev) => setSearch(ev.target.value)}
                placeholder={appI18n.t("legacyInline.work_order.presentation_components_work_order_calendar_work_order_calendar_component.k008")}
                prefix={<Search size={16} />}
                style={{ width: isMobileViewport ? "100%" : 220 }}
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: isMobileViewport ? "stretch" : "center",
              marginTop: 8,
              flexDirection: isMobileViewport ? "column" : "row",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <Button icon={<ChevronLeft size={18} />} onClick={handlePrev} />
              <Button icon={<ChevronRight size={18} />} onClick={handleNext} />
              <Button onClick={handleToday}>{appI18n.t("legacyInline.work_order.presentation_components_work_order_calendar_work_order_calendar_component.k009")}</Button>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                width: isMobileViewport ? "100%" : "auto",
              }}
            >
              <div
                style={{
                  borderRadius: "var(--radius-sm)",
                  overflow: "hidden",
                  boxSizing: "border-box",
                  padding: 2,
                  background: "transparent",
                  width: isMobileViewport ? "100%" : "auto",
                }}
              >
                <Segmented
                  value={viewMode}
                  onChange={(v) => {
                    const next = String(v);
                    if (next === "month" || next === "week" || next === "day") {
                      setViewMode(next);
                    }
                  }}
                  options={[
                    { label: appI18n.t("legacyInline.work_order.presentation_components_work_order_calendar_work_order_calendar_component.k010"), value: "month" },
                    { label: appI18n.t("legacyInline.work_order.presentation_components_work_order_calendar_work_order_calendar_component.k011"), value: "week" },
                    { label: appI18n.t("legacyInline.work_order.presentation_components_work_order_calendar_work_order_calendar_component.k012"), value: "day" },
                  ]}
                  style={{ width: isMobileViewport ? "100%" : "auto" }}
                />
              </div>
            </div>
          </div>
        </ToolbarRow>

        <CalendarWrap ref={wrapRef}>
          <CalendarHost ref={hostRef} />
        </CalendarWrap>
      </CalendarShell>
    </>
  );
}

export default WorkOrderCalendar;

