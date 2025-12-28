import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Input, Segmented, Typography } from "antd";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight, Search, Settings } from "lucide-react";

import Calendar from "@toast-ui/calendar";
import type { EventObject } from "@toast-ui/calendar";

import { useScheduleApi } from "../../../services/schedule.service";
import type { ScheduleCategory } from "../../../interfaces/schedule-category.model";
import type { ScheduleEvent } from "../../../interfaces/schedule-event.model";

import {
  CalendarShell,
  ToolbarRow,
  ToolbarLeft,
  ToolbarRight,
  CalendarWrap,
  CalendarHost,
} from "./schedule-calendar.component.styles";

import { ScheduleEventModal } from "../schedule-event-modal/schedule-event-modal.component";
import type { ScheduleEventDraft } from "../schedule-event-modal/schedule-event-modal.form.types";

type ViewMode = "month";

export function ScheduleCalendar() {
  const api = useScheduleApi();

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<Calendar | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [headerLabel, setHeaderLabel] = useState<string>(
    dayjs().format("MMMM YYYY")
  );
  const [search, setSearch] = useState("");

  const [categories, setCategories] = useState<ScheduleCategory[]>([]);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialDate, setModalInitialDate] = useState<string | undefined>(
    undefined
  );
  const [modalInitialStartTime, setModalInitialStartTime] = useState<
    string | undefined
  >(undefined);

  const tuiCalendars = useMemo(() => {
    return categories.map((c) => ({
      id: c.id,
      name: c.label,
      backgroundColor: c.color,
      borderColor: c.color,
      color: "var(--on-tertiary)",
    }));
  }, [categories]);

  const filteredEvents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return events;

    return events.filter((e) => {
      const titleMatch = e.title.toLowerCase().includes(q);
      const descMatch = (e.description ?? "").toLowerCase().includes(q);
      return titleMatch || descMatch;
    });
  }, [events, search]);

  const tuiEvents = useMemo<EventObject[]>(() => {
    return filteredEvents.map((e) => {
      const start = dayjs(
        `${e.date} ${e.startTime}`,
        "YYYY-MM-DD HH:mm"
      ).toDate();
      const end = dayjs(`${e.date} ${e.endTime}`, "YYYY-MM-DD HH:mm").toDate();

      return {
        id: e.id,
        calendarId: e.categoryId,
        title: e.title,
        category: "time",
        start,
        end,
        raw: {
          description: e.description,
          date: e.date,
          startTime: e.startTime,
          endTime: e.endTime,
        },
      };
    });
  }, [filteredEvents]);

  const calendarTheme = useMemo(() => {
    return {
      common: {
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)",
        dayName: { color: "var(--color-text-muted)" },
        holiday: { color: "var(--color-text-muted)" },
        saturday: { color: "var(--color-text-muted)" },
        today: { color: "var(--color-primary)" },
        gridSelection: {
          backgroundColor: "var(--color-glass-surface)",
          borderColor: "var(--color-primary)",
        },
      },
      month: {
        dayName: {
          backgroundColor: "var(--color-surface)",
          borderLeft: "var(--color-border)",
          borderTop: "var(--color-border)",
          borderBottom: "var(--color-border)",
        },
        gridCell: {
          headerHeight: 30,
          footerHeight: 0,
        },
      },
    };
  }, []);

  const syncHostHeight = () => {
    const wrap = wrapRef.current;
    const host = hostRef.current;
    if (!wrap || !host) return;

    const rect = wrap.getBoundingClientRect();
    const h = Math.floor(rect.height);
    if (!h) return;

    host.style.height = `${h}px`;
  };

  const safeRender = () => {
    const inst = instanceRef.current as any;
    if (!inst) return;

    syncHostHeight();

    const doRender = () => inst.render?.();

    requestAnimationFrame(() => {
      doRender();
      requestAnimationFrame(() => doRender());
    });
  };

  const refreshHeaderLabel = () => {
    const inst = instanceRef.current as any;
    if (!inst) return;

    const current = inst.getDate?.();
    if (!current) return;

    setHeaderLabel(dayjs(current).format("MMMM YYYY"));
  };

  const loadMonthEventsFromInstance = async () => {
    const inst = instanceRef.current as any;
    if (!inst) return;

    const current = inst.getDate?.();
    if (!current) return;

    const from = dayjs(current).startOf("month").format("YYYY-MM-DD");
    const to = dayjs(current).endOf("month").format("YYYY-MM-DD");
    const ev = await api.getEvents({ from, to });

    setEvents(ev);
  };

  useEffect(() => {
    (async () => {
      const cats = await api.getCategories();
      setCategories(cats);

      const from = dayjs().startOf("month").format("YYYY-MM-DD");
      const to = dayjs().endOf("month").format("YYYY-MM-DD");
      const ev = await api.getEvents({ from, to });
      setEvents(ev);
    })();
  }, [api]);

  useEffect(() => {
    if (!hostRef.current) return;

    syncHostHeight();

    instanceRef.current?.destroy?.();
    instanceRef.current = null;

    const inst = new Calendar(hostRef.current, {
      height: "100%",
      defaultView: viewMode,
      calendars: tuiCalendars,
      events: tuiEvents,
      theme: calendarTheme as any,
      month: {
        startDayOfWeek: 0,
        visibleWeeksCount: 0,
        isAlways6Weeks: false,
      },
      usageStatistics: false,
      useDetailPopup: true,
      useFormPopup: false,
    } as any);

    inst.on("clickEvent", (e: any) => {
      const ev = e?.event;
      if (!ev) return;
    });

    inst.on("selectDateTime", (e: any) => {
      const start = e?.start ? dayjs(e.start) : null;
      if (!start) return;

      setModalInitialDate(start.format("YYYY-MM-DD"));
      setModalInitialStartTime(start.format("HH:mm"));
      setIsModalOpen(true);
    });

    instanceRef.current = inst;

    refreshHeaderLabel();
    safeRender();

    return () => {
      instanceRef.current?.destroy?.();
      instanceRef.current = null;
    };
  }, [viewMode, calendarTheme, tuiCalendars, tuiEvents]);

  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return;

    const ro = new ResizeObserver(() => safeRender());
    ro.observe(node);

    safeRender();

    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    safeRender();
  }, [isModalOpen]);

  const handlePrev = async () => {
    const inst = instanceRef.current as any;
    if (!inst) return;
    inst.prev();
    refreshHeaderLabel();
    await loadMonthEventsFromInstance();
    safeRender();
  };

  const handleNext = async () => {
    const inst = instanceRef.current as any;
    if (!inst) return;
    inst.next();
    refreshHeaderLabel();
    await loadMonthEventsFromInstance();
    safeRender();
  };

  const handleToday = async () => {
    const inst = instanceRef.current as any;
    if (!inst) return;
    inst.today();
    refreshHeaderLabel();
    await loadMonthEventsFromInstance();
    safeRender();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleConfirmModal = (draft: ScheduleEventDraft) => {
    const newEvent: ScheduleEvent = {
      id: `temp-${Date.now()}`,
      title: draft.title,
      description: draft.description,
      categoryId: draft.categoryId,
      date: draft.date,
      startTime: draft.startTime,
      endTime: draft.endTime,
    };

    setEvents((prev) => [newEvent, ...prev]);
    setIsModalOpen(false);
  };

  return (
    <>
      <CalendarShell>
        <ToolbarRow>
          <ToolbarLeft>
            <Typography.Title level={3} style={{ margin: 0 }}>
              {headerLabel}
            </Typography.Title>

            <Button icon={<ChevronLeft size={18} />} onClick={handlePrev} />
            <Button icon={<ChevronRight size={18} />} onClick={handleNext} />
            <Button onClick={handleToday}>Today</Button>
          </ToolbarLeft>

          <ToolbarRight>
            <Segmented
              value={viewMode}
              onChange={(v) => setViewMode(v as ViewMode)}
              options={[{ label: "Month", value: "month" }]}
            />

            <Input
              value={search}
              onChange={(ev) => setSearch(ev.target.value)}
              placeholder="Search events..."
              prefix={<Search size={16} />}
              style={{ width: 220 }}
            />

            <Button icon={<Settings size={18} />} />
          </ToolbarRight>
        </ToolbarRow>

        <CalendarWrap ref={wrapRef}>
          <CalendarHost ref={hostRef} />
        </CalendarWrap>
      </CalendarShell>

      <ScheduleEventModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmModal}
        categories={categories}
        initialDate={modalInitialDate}
        initialStartTime={modalInitialStartTime}
      />
    </>
  );
}
