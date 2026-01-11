import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Input, Segmented, Typography, message } from "antd";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight, Search, Settings, Edit, User, Clock, Tag, Trash2 } from "lucide-react";

import Calendar from "@toast-ui/calendar";
import type { EventObject } from "@toast-ui/calendar";

import { useScheduleApi } from "../../../services/schedule.service";
import { loadingService } from "@shared/ui/services/loading.service";
import type { ScheduleCategory } from "../../../interfaces/schedule-category.model";
import type { ScheduleEvent } from "../../../interfaces/schedule-event.model";

import {
  CalendarShell,
  ToolbarRow,
  ToolbarLeft,
  ToolbarRight,
  CalendarWrap,
  CalendarHost,
  ToastUIGlobalStyles,
} from "./schedule-calendar.component.styles";

import { ScheduleEventModal } from "../schedule-event-modal/schedule-event-modal.component";
import type { ScheduleEventDraft } from "../schedule-event-modal/schedule-event-modal.form.types";

function escapeHtml(input?: string | null) {
  if (!input) return "";
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

type ViewMode = "month";

type ScheduleCalendarProps = {
  availableServices?: import("@modules/company/interfaces/service.model").CompanyServiceModel[];
  availableEmployees?: import("@modules/people/interfaces/employee.model").EmployeeModel[];
  workspaceId?: string | null;
  onCreate?: (draft: import("../schedule-event-modal/schedule-event-modal.form.types").ScheduleEventDraft) => Promise<void>;
  events?: import("../../../interfaces/schedule-event.model").ScheduleEvent[];
  onRangeChange?: (from: string, to: string) => Promise<void>;
};

export function ScheduleCalendar(props: ScheduleCalendarProps) {
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
  const [events, setEvents] = useState<ScheduleEvent[]>(props.events ?? []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialDate, setModalInitialDate] = useState<string | undefined>(
    undefined
  );
  const [modalInitialStartTime, setModalInitialStartTime] = useState<
    string | undefined
  >(undefined);

  // React-controlled popup state (replacement for native detail popup)
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ left: number; top: number } | null>(null);

  const { events: propEvents, workspaceId: propWorkspaceId, onRangeChange: propOnRangeChange, onCreate: propOnCreate, availableServices: propAvailableServices, availableEmployees: propAvailableEmployees } = props;

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
    const out: EventObject[] = [];
    const root = typeof document !== 'undefined' ? document.documentElement : null;
    const themeText = root ? getComputedStyle(root).getPropertyValue('--toastui-calendar-text').trim() : '';
    const themeOnPrimary = root ? getComputedStyle(root).getPropertyValue('--toastui-calendar-on-primary').trim() : '';
    const themePrimary = root ? getComputedStyle(root).getPropertyValue('--toastui-calendar-primary').trim() : '';

    const statusColorMap: Record<string, string> = {
      pending: "#60A5FA",
      confirmed: "#16A34A",
      in_progress: "#DC2626",
      cancelled: "#F97316",
      completed: "#7C3AED",
    };

    filteredEvents.forEach((e) => {
      const start = dayjs(`${e.date}T${e.startTime}`).toDate();
      const end = dayjs(`${e.date}T${e.endTime}`).toDate();

      if (!start || isNaN((start as any).getTime())) {
        console.debug("ScheduleCalendar: skipping event with invalid start", e);
        return;
      }

      if (!end || isNaN((end as any).getTime())) {
        console.debug("ScheduleCalendar: skipping event with invalid end", e);
        return;
      }

      const category = categories.find((c) => c.id === e.categoryId);
      const categoryColor = category?.color ?? themePrimary ?? '#1e70ff';
      const statusCode = (e as any)?.status?.code ?? null;
      const statusColor = statusCode ? (statusColorMap[statusCode] ?? themePrimary ?? '#7c3aed') : (categoryColor ?? themePrimary ?? '#1e70ff');
      const textColor = themeOnPrimary || themeText || '#ffffff';

      const startText = dayjs(start).format("YYYY.MM.DD HH:mm");
      const endText = dayjs(end).format("HH:mm");
      const bodyHtml = `
        <div style="background:var(--color-surface);color:var(--color-text);border:1px solid var(--color-border);box-shadow:var(--shadow-md);border-radius:8px;padding:12px;width:250px;font-family:inherit;overflow:hidden;">
          <div style="font-weight:800;margin-bottom:6px;color:var(--color-text);">${escapeHtml(e.title)}</div>
          <div style="font-size:12px;color:var(--color-text-muted);margin-bottom:8px;">${startText} — ${endText}</div>
          <div style="font-size:13px;color:var(--color-text);">${escapeHtml(e.description ?? '')}</div>
        </div>
      `;

      out.push({
        id: e.id,
        calendarId: e.categoryId,
        title: e.title,
        category: "time",
        start,
        end,
        // visual properties supported by toast-ui Calendar
        // use `statusColor` as the event background (card) so whole card is colored
        backgroundColor: statusColor,
        borderColor: statusColor,
        color: textColor,
        dragBackgroundColor: statusColor,
        customStyle: { fontWeight: '700' },
        // provide a full HTML body (inline styles using app CSS variables)
        body: bodyHtml,
        raw: {
          description: e.description,
          date: e.date,
          startTime: e.startTime,
          endTime: e.endTime,
          services: (e as any).services ?? null,
          workers: (e as any).workers ?? null,
          _bodyHtml: bodyHtml,
          status: (e as any).status ?? null,
          statusColor,
          categoryColor,
        },
      } as any);
    });

    console.debug("ScheduleCalendar: tuiEvents generated", out.length, out.map((x) => ({ id: x.id, start: x.start, statusColor: (x as any).backgroundColor, rawStatus: (x as any).raw?.status })));
    return out;
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

  // Apply per-event colors directly to DOM nodes when Toast UI doesn't propagate them
  const applyEventDomColors = () => {
    const host = hostRef.current;
    if (!host) return;

    // run on next frame to ensure calendar rendered
    requestAnimationFrame(() => {
      try {
        tuiEvents.forEach((ev) => {
          const id = ev.id as string;
          if (!id) return;
          const nodes = host.querySelectorAll(`[data-event-id="${id}"]`);
          nodes.forEach((n) => {
            const el = n as HTMLElement;
            const statusColor = (ev as unknown as any).backgroundColor || (ev as any).raw?.statusColor;
            const categoryColor = (ev as any).raw?.categoryColor;

            try {
              if (statusColor) el.style.setProperty('background-color', statusColor, 'important');
              if (statusColor) el.style.background = statusColor;
            } catch (err) {
              console.debug(err);
              if (statusColor) el.style.background = statusColor;
            }

            // ensure any template popup width is enforced and remove stray max-width
            try {
              const popups = document.querySelectorAll<HTMLElement>('.tui-custom-popup');
              popups.forEach((p) => {
                try {
                  p.style.removeProperty('max-width');
                  p.style.setProperty('width', '250px', 'important');
                } catch (err) { console.debug(err); }
              });
            } catch (err) { console.debug(err); }

            const dot = el.querySelector('.toastui-calendar-weekday-event-dot, .tui-custom-dot, .toastui-calendar-monthly-event-dot') as HTMLElement | null;
            if (dot) {
              try {
                const dotColor = categoryColor || statusColor;
                if (dotColor) dot.style.setProperty('background-color', dotColor, 'important');
                if (dotColor) dot.style.background = dotColor;
              } catch (err) {
                console.debug(err);
                const dotColor = categoryColor || statusColor;
                if (dotColor) dot.style.background = dotColor;
              }
            }
          });
        });

        try { console.debug('applyEventDomColors applied', { count: tuiEvents.length }); } catch (err) { console.debug(err); }
      } catch (err) {
        console.debug(err);
      }
    });
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
    if (propOnRangeChange) {
      await propOnRangeChange(from, to);
    } else {
      const ev = await api.getEvents({ from, to, workspaceId: propWorkspaceId ?? null });
      setEvents(ev);
    }
  };

   
  useEffect(() => {
    (async () => {
      const cats = await api.getCategories();
      setCategories(cats);

      // Only fetch initial events here when parent did not provide `events`.
      if (props.events === undefined) {
        const from = dayjs().startOf("month").format("YYYY-MM-DD");
        const to = dayjs().endOf("month").format("YYYY-MM-DD");
        if (props.onRangeChange) {
          await props.onRangeChange(from, to);
        } else {
          const ev = await api.getEvents({ from, to, workspaceId: props.workspaceId ?? null });
          setEvents(ev);
        }
      }
    })();
    // avoid re-running for changing onRangeChange identity - parent should provide stable callback
  }, [api, propWorkspaceId]);

  useEffect(() => {
    setEvents(propEvents ?? []);
  }, [propEvents]);

  useEffect(() => {
    if (!hostRef.current) return;

    syncHostHeight();

    // create calendar once on mount
    const inst = new Calendar(hostRef.current, {
      height: "100%",
      defaultView: viewMode,
      calendars: tuiCalendars,
      events: tuiEvents,
      theme: calendarTheme as any,
      template: {
        monthGridEvent: (model: any) => {
          try {
            // debug model at runtime to inspect color fields
            try { console.debug('tui.monthGridEvent model', model); } catch (err) { console.debug(err); }
            const cardBg = model?.raw?.statusColor || model.backgroundColor || `var(--color-primary)`;
            const dotColor = model?.raw?.categoryColor || model.backgroundColor || `var(--color-primary)`;
            const fg = model.color || `var(--color-text)`;
              return `
                <div class="tui-custom-month-event"
                     style="display:flex;align-items:center;gap:8px;
                            background:${cardBg} !important;padding:6px;border-radius:6px;color:${fg};">
                  <span class="tui-custom-dot"
                        style="width:8px;height:8px;border-radius:999px;display:inline-block;
                               background:${dotColor} !important;"></span>
                  <span class="tui-custom-title"
                        style="color:${fg};font-weight:700;font-size:12px;
                               white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                    ${escapeHtml(model.title)}
                  </span>
                </div>
              `;
          } catch (err) {
            return escapeHtml(model.title || "");
          }
        },
        popupDetail: (model: any) => {
          try {
            const fg = model.color || `var(--color-text)`;
            const bg = model?.raw?.statusColor || model.backgroundColor || `var(--color-surface)`;
            const start = model.start ? dayjs(model.start) : null;
            const end = model.end ? dayjs(model.end) : null;
            const timeRange = start && end ? `${start.format("HH:mm")} — ${end.format("HH:mm")}` : "";
            const body = model.body || (model.raw && model.raw.description) || "";
            const workers = (model.raw && model.raw.workers) || null;
            const workersText = Array.isArray(workers) && workers.length > 0
              ? workers.map((w: any) => escapeHtml((w && (w.email || w.fullName || w.userUid)) || '')).join(', ')
              : null;
            const categoryLabel = model.calendarId || '';
            // TUI-style fixed popup layout inspired by Toast UI example (keeps app theme)
            return `
              <div class="tui-custom-popup" style="color:${fg};background:${bg} !important;padding:16px;width:250px;font-family:inherit;overflow:hidden;">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px;">
                  <div style="flex:1;min-width:0;">
                    <div style="display:flex;align-items:center;gap:8px;">
                      <div class="tui-custom-popup-title" style="font-weight:800;color:${fg};font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;">${escapeHtml(model.title)}</div>
                      <div class="tui-custom-popup-status" style="flex:0 0 auto;margin-left:8px;padding:4px 8px;border-radius:12px;background:rgba(255,255,255,0.06);color:var(--color-text);font-size:12px;">${escapeHtml((model.raw && model.raw.status && (model.raw.status.label || model.raw.status.code)) || '')}</div>
                    </div>
                    <div style="font-size:12px;color:var(--toastui-calendar-text-muted);margin-top:6px;display:flex;align-items:center;gap:8px;">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="currentColor"/></svg>
                      <span>${timeRange}</span>
                    </div>
                  </div>
                </div>

                <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:8px;">
                  <div style="font-size:13px;color:var(--toastui-calendar-text);line-height:1.3;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(body)}</div>
                  <div style="display:flex;gap:10px;align-items:center;font-size:12px;color:var(--toastui-calendar-text-muted);">
                    <div style="display:flex;align-items:center;gap:6px;min-width:0;flex:1;overflow:hidden;">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex:0 0 14px;color:currentColor;"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zM12 14c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z" fill="currentColor"/></svg>
                      <div style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${workersText ? workersText : '—'}</div>
                    </div>
                    <div style="display:flex;align-items:center;gap:6px;flex:0 0 auto;">
                      <span style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--toastui-calendar-text-muted);">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2v4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 12H4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        <span style="display:inline-block;vertical-align:middle;">${escapeHtml(categoryLabel)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div class="tui-custom-popup-footer" style="display:flex;gap:8px;justify-content:flex-end;margin-top:6px;">
                  <button class="ant-btn ant-btn-default ant-btn-sm tui-custom-popup-delete" title="Delete">Delete</button>
                  <button class="ant-btn ant-btn-primary ant-btn-sm tui-custom-popup-edit" title="Edit">Edit</button>
                </div>
              </div>`;
          } catch (err) {
            return model.title || "";
          }
        },
      },
      month: {
        startDayOfWeek: 0,
        visibleWeeksCount: 0,
        isAlways6Weeks: false,
      },
      usageStatistics: false,
      useDetailPopup: false, // disable native popup — we'll render a React popup
      useFormPopup: false,
    } as any);

    inst.on("clickEvent", (e: any) => {
      console.debug("ScheduleCalendar.clickEvent", { e });
      const ev = e?.event;
      if (!ev) {
        console.debug("ScheduleCalendar.clickEvent: no ev found");
        return;
      }
      // show React popup anchored to click position
      const dom = e?.domEvent || e?.nativeEvent || null;
      if (dom && wrapRef.current) {
        const rect = wrapRef.current.getBoundingClientRect();
        const clientX = dom.clientX ?? (dom.touches && dom.touches[0] && dom.touches[0].clientX) ?? null;
        const clientY = dom.clientY ?? (dom.touches && dom.touches[0] && dom.touches[0].clientY) ?? null;
        if (clientX != null && clientY != null) {
          const x = clientX - rect.left;
          const y = clientY - rect.top;
          setPopupPosition({ left: Math.max(8, x), top: Math.max(8, y) });
        } else {
          // fallback center
          setPopupPosition({ left: Math.floor(rect.width / 2), top: Math.floor(rect.height / 2) });
        }
      } else if (wrapRef.current) {
        // fallback: center in calendar
        const rect = wrapRef.current.getBoundingClientRect();
        setPopupPosition({ left: Math.floor(rect.width / 2), top: Math.floor(rect.height / 2) });
      }
      setSelectedEvent(ev);
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
    // ensure DOM nodes receive color styles
    applyEventDomColors();

    return () => {
      instanceRef.current?.destroy?.();
      instanceRef.current = null;
    };
    // mount only
  }, []);

  // update events on existing instance without recreating the whole calendar
  useEffect(() => {
    const inst = instanceRef.current as any;
    if (!inst) return;

    // prefer instance methods to update events in-place
    try {
      if (typeof inst.clear === "function" && typeof inst.createEvents === "function") {
        inst.clear();
        if (tuiEvents && tuiEvents.length > 0) inst.createEvents(tuiEvents);
        inst.render?.();
        refreshHeaderLabel();
        // ensure DOM nodes receive color styles
        applyEventDomColors();
        return;
      }
    } catch (err) {
      console.debug(err);
      // fallthrough to recreate fallback
    }

    // fallback: recreate (preserve date)
    try {
      const prevDate = inst.getDate?.();
      inst.destroy?.();
      const host = hostRef.current;
      if (!host) {
        instanceRef.current = null;
        return;
      }
      const next = new Calendar(host, {
        height: "100%",
        defaultView: viewMode,
        calendars: tuiCalendars,
        events: tuiEvents,
        theme: calendarTheme as any,
        template: {
          monthGridEvent: (model: any) => {
            try {
              try { console.debug('tui.monthGridEvent (fallback) model', model); } catch (err) { console.debug(err); }
              const cardBg = model?.raw?.statusColor || model.backgroundColor || model.calendarId || "var(--toastui-calendar-primary)";
              const dotColor = model.backgroundColor || model?.raw?.categoryColor || model.calendarId || "var(--toastui-calendar-primary)";
              const fg = model.color || "var(--toastui-calendar-text)";
                return `<div class="tui-custom-month-event" style="display:flex;align-items:center;gap:8px;background:${cardBg} !important;padding:6px;border-radius:6px;color:${fg};">
                            <span class="tui-custom-dot" style="width:8px;height:8px;border-radius:999px;display:inline-block;background:${dotColor} !important;flex:0 0 auto;"></span>
                            <span class="tui-custom-title" style="color:${fg};font-weight:700;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(model.title)}</span>
                          </div>`;
            } catch (err) {
              return model.title || "";
            }
          },
          popupDetail: (model: any) => {
            try {
              const fg = model.color || `var(--color-text)`;
              const bg = model?.raw?.statusColor || model.backgroundColor || `var(--color-surface)`;
              const start = model.start ? dayjs(model.start) : null;
              const end = model.end ? dayjs(model.end) : null;
              const timeRange = start && end ? `${start.format("HH:mm")} — ${end.format("HH:mm")}` : "";
              const body = model.body || (model.raw && model.raw.description) || "";
              // build worker emails list if available
              const workers = (model.raw && model.raw.workers) || null;
              const workersText = Array.isArray(workers) && workers.length > 0
                ? workers.map((w: any) => escapeHtml((w && (w.email || w.fullName || w.userUid)) || '')).join(', ')
                : null;
              const categoryLabel = model.calendarId || '';
              return `
                  <div class="tui-custom-popup" style="color:${fg};background:${bg} !important;padding:12px;width:250px;font-family:inherit;overflow:hidden;">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px;">
                      <div style="flex:1;min-width:0;">
                        <div style="display:flex;align-items:center;gap:8px;">
                          <div class="tui-custom-popup-title" style="font-weight:800;color:${fg};font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;">${escapeHtml(model.title)}</div>
                          <div class="tui-custom-popup-status" style="flex:0 0 auto;margin-left:8px;padding:4px 8px;border-radius:12px;background:rgba(255,255,255,0.06);color:var(--color-text);font-size:12px;">${escapeHtml((model.raw && model.raw.status && (model.raw.status.label || model.raw.status.code)) || '')}</div>
                        </div>
                        <div style="font-size:12px;color:var(--toastui-calendar-text-muted);margin-top:6px;display:flex;align-items:center;gap:8px;">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="currentColor"/></svg>
                          <span>${timeRange}</span>
                        </div>
                      </div>
                    </div>

                    <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:8px;">
                      <div style="font-size:13px;color:var(--toastui-calendar-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(body)}</div>
                      <div style="display:flex;gap:10px;align-items:center;font-size:12px;color:var(--toastui-calendar-text-muted);">
                        <div style="display:flex;align-items:center;gap:6px;min-width:0;flex:1;overflow:hidden;">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex:0 0 14px;color:currentColor;"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zM12 14c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z" fill="currentColor"/></svg>
                          <div style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${workersText ? workersText : '—'}</div>
                        </div>
                        <div style="display:flex;align-items:center;gap:6px;flex:0 0 auto;">
                          <span style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--toastui-calendar-text-muted);">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2v4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 12H4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            <span style="display:inline-block;vertical-align:middle;">${escapeHtml(categoryLabel)}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style="position:absolute;left:12px;right:12px;bottom:12px;display:flex;gap:8px;justify-content:flex-end;">
                      <button class="tui-custom-popup-edit" title="Edit" style="display:inline-flex;align-items:center;gap:8px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/></svg>Edit</button>
                      <button class="tui-custom-popup-delete" title="Delete" style="display:inline-flex;align-items:center;gap:8px;">Delete</button>
                    </div>
                  </div>`;
            } catch (err) {
              return model.title || "";
            }
          },
        },
        month: {
          startDayOfWeek: 0,
          visibleWeeksCount: 0,
          isAlways6Weeks: false,
        },
        usageStatistics: false,
        useDetailPopup: false,
        useFormPopup: false,
      } as any);
      if (prevDate) {
        try { (next as any).setDate?.(prevDate); } catch (err) { console.debug(err); }
      }
      instanceRef.current = next;
      refreshHeaderLabel();
      safeRender();
      // apply colors after recreate
      applyEventDomColors();
      // styling handled via styled-components in CalendarHost
    } catch (err) {
      console.error("ScheduleCalendar: failed to update events", err);
    }
  }, [tuiEvents]);

  // close popup when clicking outside
  useEffect(() => {
    const handler = (ev: MouseEvent) => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      if (!(ev.target instanceof Node)) return;
      if (!wrap.contains(ev.target)) {
        setSelectedEvent(null);
        setPopupPosition(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Delegated handler for template-rendered popup delete buttons (native TUI popup).
  useEffect(() => {
    const eventsRef = { current: events };
    const onClick = async (ev: MouseEvent) => {
      const target = ev.target as HTMLElement | null;
      if (!target) return;
      const btn = target.closest('.tui-custom-popup-delete') as HTMLElement | null;
      if (!btn) return;
      // find nearest popup container
      const popup = btn.closest('.tui-custom-popup') as HTMLElement | null;
      if (!popup) return;

      // attempt to find event id: check data-event-id on siblings or searched elements
      let id: string | null = null;
      // look for attribute on popup or parent nodes
      let node: HTMLElement | null = popup;
      while (node && !id) {
        if (node.hasAttribute && node.hasAttribute('data-event-id')) {
          id = node.getAttribute('data-event-id');
          break;
        }
        node = node.parentElement;
      }

      // fallback: match by title text inside popup
      if (!id) {
        const titleEl = popup.querySelector('.tui-custom-popup-title');
        const titleText = titleEl ? titleEl.textContent?.trim() ?? '' : '';
        if (titleText) {
          const found = (eventsRef.current || events).find((e) => e.title === titleText);
          if (found) id = found.id;
        }
      }

      if (!id) {
        message.error('Could not determine event to delete');
        return;
      }

      try {
        loadingService.show();
        const ok = await api.removeEvent(id);
        if (ok) {
          try { await loadMonthEventsFromInstance(); } catch (e) { console.debug(e); }
          message.success('Event deleted');
        } else {
          message.error('Failed to delete event');
        }
      } catch (err) {
        console.error(err);
        message.error('Failed to delete event');
      } finally {
        loadingService.hide();
        setSelectedEvent(null);
        setPopupPosition(null);
      }
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [events, api]);

  // debug popup state changes
  useEffect(() => {
    console.debug("ScheduleCalendar.popupState", { selectedEvent, popupPosition });
  }, [selectedEvent, popupPosition]);
  // styling is provided via styled-components in the styles file

   
  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return;

    const ro = new ResizeObserver(() => safeRender());
    ro.observe(node);

    safeRender();

    return () => ro.disconnect();
  }, []);

  // Ensure popups created later by Toast UI do not carry unwanted inline max-width.
   
  useEffect(() => {
    const enforcePopup = (el: HTMLElement) => {
      try {
        el.style.removeProperty('max-width');
        el.style.setProperty('width', '250px', 'important');
      } catch (err) {
        console.debug(err);
      }
    };

    const scanAndFix = () => {
      try {
        const popups = document.querySelectorAll<HTMLElement>('.tui-custom-popup');
        popups.forEach((p) => enforcePopup(p));
      } catch (err) { console.debug(err); }
    };

    // initial scan
    scanAndFix();

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'childList' && m.addedNodes && m.addedNodes.length) {
          m.addedNodes.forEach((n) => {
            try {
              if (!(n instanceof HTMLElement)) return;
              if (n.classList && n.classList.contains('tui-custom-popup')) enforcePopup(n as HTMLElement);
              // if the added node contains popups deeper
              const inner = n.querySelectorAll && n.querySelectorAll('.tui-custom-popup');
              if (inner && inner.length) inner.forEach((el: any) => enforcePopup(el as HTMLElement));
            } catch (err) { console.debug(err); }
          });
        }
        if (m.type === 'attributes' && m.target instanceof HTMLElement) {
          const t = m.target as HTMLElement;
          if (t.classList && t.classList.contains('tui-custom-popup')) enforcePopup(t);
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });

    return () => observer.disconnect();
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

  const handleConfirmModal = async (draft: ScheduleEventDraft) => {
    const toCreate: Omit<ScheduleEvent, "id"> & { durationMinutes?: number | null } = {
      title: draft.title,
      date: draft.date,
      startTime: draft.startTime,
      endTime: draft.endTime,
      categoryId: draft.categoryId,
      description: draft.description,
      durationMinutes: draft.durationMinutes ?? null,
    };

      try {
      loadingService.show();
      // delegate creation to page via props.onCreate
      if (propOnCreate) {
        await propOnCreate(draft);
      } else {
        // fallback to local create if no handler provided
        await api.createSchedule({ event: toCreate, serviceIds: draft.serviceIds, employeeIds: draft.employeeIds, totalPriceCents: draft.totalPriceCents, workspaceId: propWorkspaceId ?? null });
      }

      // refresh month events
      const inst = instanceRef.current as any;
      const current = inst?.getDate?.();
      const from = dayjs(current).startOf("month").format("YYYY-MM-DD");
      const to = dayjs(current).endOf("month").format("YYYY-MM-DD");
      if (propOnRangeChange) {
        await propOnRangeChange(from, to);
      } else {
        const ev = await api.getEvents({ from, to, workspaceId: propWorkspaceId ?? null });
        setEvents(ev);
      }

      message.success("Schedule created");
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      message.error("Failed to create schedule");
    } finally {
      loadingService.hide();
    }
  };

  return (
    <>
      <ToastUIGlobalStyles />
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

          {/* React-controlled popup rendered inside the calendar wrap so it inherits theme */}
          {selectedEvent && popupPosition ? (
            <div
              className="tui-react-popup"
              style={{
                position: "absolute",
                left: popupPosition.left,
                top: popupPosition.top,
                transform: "translate(-50%, -8px)",
                zIndex: 2147483647,
                pointerEvents: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="tui-custom-popup" style={{ background: selectedEvent.raw?.statusColor || selectedEvent.backgroundColor || 'var(--color-surface)', padding: 16, width: 250, boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="tui-custom-popup-title" style={{ fontWeight: 800, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedEvent.title}</div>
                      <div className="tui-custom-popup-status" style={{ flex: '0 0 auto', marginLeft: 8, padding: '4px 8px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', color: 'var(--color-text)', fontSize: 12 }}>{(selectedEvent.raw?.status && (selectedEvent.raw?.status.label || selectedEvent.raw?.status.code)) || ''}</div>
                    </div>
                    <div className="tui-custom-popup-time" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                      <Clock size={14} />
                      <span style={{ color: 'var(--color-text-muted)' }}>{(selectedEvent.raw?.startTime && selectedEvent.raw?.endTime) ? `${selectedEvent.raw.startTime} — ${selectedEvent.raw.endTime}` : ''}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
                  <div className="tui-custom-popup-body" style={{ color: 'var(--color-text)', lineHeight: 1.3, overflow: 'hidden' }}>{selectedEvent.raw?.description || selectedEvent.body || ''}</div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 12, color: 'var(--color-text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flex: 1, overflow: 'hidden' }}>
                      <User size={14} />
                      <div style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{(selectedEvent.raw?.workers && selectedEvent.raw.workers.length) ? (selectedEvent.raw.workers.map((w: any) => w.email || w.fullName || w.userUid).join(', ')) : '—'}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: '0 0 auto' }}>
                      <Tag size={14} />
                      <div style={{ color: 'var(--color-text-muted)' }}>{selectedEvent.calendarId || '—'}</div>
                    </div>
                  </div>
                </div>

                <div className="tui-custom-popup-footer" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 6 }}>
                  <Button size="small" onClick={async () => {
                    if (!selectedEvent) return;
                    try {
                      loadingService.show();
                      const ok = await api.removeEvent(selectedEvent.id);
                      if (ok) {
                        try { await loadMonthEventsFromInstance(); } catch (e) { console.debug(e); }
                        message.success('Event deleted');
                      } else {
                        message.error('Failed to delete event');
                      }
                    } catch (err) {
                      console.error(err);
                      message.error('Failed to delete event');
                    } finally {
                      loadingService.hide();
                      setSelectedEvent(null);
                    }
                  }}>
                    <Trash2 size={14} />
                  </Button>
                  <Button type="primary" size="small" onClick={() => { setIsModalOpen(true); setSelectedEvent(null); }} icon={<Edit size={14} />}>
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </CalendarWrap>
      </CalendarShell>

      <ScheduleEventModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmModal}
        categories={categories}
        initialDate={modalInitialDate}
        initialStartTime={modalInitialStartTime}
          availableServices={propAvailableServices}
          availableEmployees={propAvailableEmployees}
      />
    </>
  );
}
