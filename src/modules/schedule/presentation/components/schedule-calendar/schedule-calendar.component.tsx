/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Input, Segmented, Typography, message } from "antd";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight, Search, Calendar as CalendarIcon } from "lucide-react";

import Calendar from "@toast-ui/calendar";
import type { EventObject } from "@toast-ui/calendar";

import { useScheduleApi } from "../../../services/schedule.service";
import { loadingService } from "@shared/ui/services/loading.service";
import type { ScheduleCategory } from "../../../interfaces/schedule-category.model";
import type { ScheduleEvent } from "../../../interfaces/schedule-event.model";

import {
  CalendarShell,
  ToolbarRow,
  CalendarWrap,
  CalendarHost,
  ToastUIGlobalStyles,
} from "./schedule-calendar.component.styles";
import {
  getStatusColor,
  getCategoryColor,
  suitableBorderForContrast,
  categoryColorMap,
} from "../../../constants/colors";

import { ScheduleEventModal } from "../schedule-event-modal/schedule-event-modal.component";
import ScheduleEventPopup from "./schedule-event-popup.component";
import {
  normalizeCssColor,
  escapeHtml,
  buildCalendarOptions,
} from "./schedule-calendar.factory";
import type { ScheduleEventDraft } from "../schedule-event-modal/schedule-event-modal.form.types";

type ScheduleCalendarProps = {
  availableServices?: import("@modules/company/interfaces/service.model").CompanyServiceModel[];
  availableEmployees?: import("@modules/people/interfaces/employee.model").EmployeeModel[];
  workspaceId?: string | null;
  onCreate?: (
    draft: import("../schedule-event-modal/schedule-event-modal.form.types").ScheduleEventDraft
  ) => Promise<void>;
  onUpdate?: (args: {
    id: string;
    event: Omit<
      import("../../../interfaces/schedule-event.model").ScheduleEvent,
      "id"
    >;
    serviceIds?: string[];
    employeeIds?: string[];
    totalPriceCents?: number;
    workspaceId?: string | null;
  }) => Promise<void>;
  events?: import("../../../interfaces/schedule-event.model").ScheduleEvent[];
  onRangeChange?: (from: string, to: string) => Promise<void>;
  categories?:
    | import("../../../interfaces/schedule-category.model").ScheduleCategory[]
    | null;
  statuses?:
    | import("@modules/schedule/services/schedules-api").ScheduleStatus[]
    | null;
  // internal view mode only; parent no longer controls it
};

export function ScheduleCalendar(props: ScheduleCalendarProps) {
  const api = useScheduleApi();

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<Calendar | null>(null);
  const eventColorMapRef = useRef<Map<string, string>>(new Map());

  const [viewMode, setViewMode] = useState<string>("month");
  const [headerLabel, setHeaderLabel] = useState<string>(
    dayjs().format("MMMM YYYY")
  );
  const [search, setSearch] = useState("");

  const [categories, setCategories] = useState<ScheduleCategory[]>(
    props.categories ?? []
  );
  const [events, setEvents] = useState<ScheduleEvent[]>(props.events ?? []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialDate, setModalInitialDate] = useState<string | undefined>(
    undefined
  );
  const [modalInitialStartTime, setModalInitialStartTime] = useState<
    string | undefined
  >(undefined);
  const [modalInitialDraft, setModalInitialDraft] = useState<
    | (import("../schedule-event-modal/schedule-event-modal.form.types").ScheduleEventDraft & {
        id?: string;
      })
    | undefined
  >(undefined);

  // React-controlled popup state (replacement for native detail popup)
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [popupPosition, setPopupPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);

  const {
    events: propEvents,
    workspaceId: propWorkspaceId,
    onRangeChange: propOnRangeChange,
    onCreate: propOnCreate,
    availableServices: propAvailableServices,
    availableEmployees: propAvailableEmployees,
  } = props;

  const tuiCalendars = useMemo(() => {
    return categories.map((c) => ({
      id: String(c.id),
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
    const root =
      typeof document !== "undefined" ? document.documentElement : null;
    const themeText = root
      ? getComputedStyle(root)
          .getPropertyValue("--toastui-calendar-text")
          .trim()
      : "";
    const themeOnPrimary = root
      ? getComputedStyle(root)
          .getPropertyValue("--toastui-calendar-on-primary")
          .trim()
      : "";
    const themePrimary = root
      ? getComputedStyle(root)
          .getPropertyValue("--toastui-calendar-primary")
          .trim()
      : "";

    // use shared status/category colors and contrast helpers

    filteredEvents.forEach((e) => {
      const start = dayjs(`${e.date}T${e.startTime}`).toDate();
      const end = dayjs(`${e.date}T${e.endTime}`).toDate();

      if (!start || isNaN((start as any).getTime())) {
        return;
      }

      if (!end || isNaN((end as any).getTime())) {
        return;
      }

      // match category by stringified id to avoid mismatches (number vs string)
      // also try matching by category object or by category code to cover responses
      // that return codes instead of ids or embed the category object only.
      const rawCat = (e as any).category as
        | Record<string, any>
        | undefined
        | null;
      const category = categories.find((c) => {
        const cid = String(c.id ?? "");
        const ccode = String((c as any).code ?? "");
        const eCatId = e.categoryId ? String(e.categoryId) : "";
        const eRawCatId = rawCat && rawCat.id ? String(rawCat.id) : "";
        const eRawCatCode = rawCat && rawCat.code ? String(rawCat.code) : "";
        return (
          cid === eCatId ||
          cid === eRawCatId ||
          ccode === eCatId ||
          ccode === eRawCatCode
        );
      });
      const rawCategoryColor = category?.color ?? themePrimary ?? "#1e70ff";
      const categoryColor =
        normalizeCssColor(rawCategoryColor) ?? rawCategoryColor;
      const statusCode = (e as any)?.status?.code ?? null;
      const statusColorRaw = statusCode
        ? (getStatusColor(statusCode) ?? themePrimary ?? "#7c3aed")
        : undefined;
      const statusColor = normalizeCssColor(statusColorRaw) ?? statusColorRaw;
      const textColor = themeOnPrimary || themeText || "#ffffff";

      const startText = dayjs(start).format("YYYY.MM.DD HH:mm");
      const endText = dayjs(end).format("HH:mm");
      const bodyHtml = `
        <div style="background:var(--color-surface);color:var(--color-text);border:1px solid var(--color-border);box-shadow:var(--shadow-md);border-radius:8px;padding:12px;width:250px;font-family:inherit;overflow:hidden;">
          <div style="font-weight:800;margin-bottom:6px;color:var(--color-text);">${escapeHtml(e.title)}</div>
          <div style="font-size:12px;color:var(--color-text-muted);margin-bottom:8px;">${startText} — ${endText}</div>
          <div style="font-size:13px;color:var(--color-text);">${escapeHtml(e.description ?? "")}</div>
        </div>
      `;

      // prefer category color for the main card; only fallback to status when category color is missing
      const preferCategory = (c?: string | undefined) =>
        c && String(c).trim() ? c : undefined;

      out.push({
        id: e.id,
        // ensure calendarId is a string so it matches tuiCalendars ids
        calendarId: String((e as any).category?.id ?? e.categoryId),
        title: e.title,
        category: "time",
        start,
        end,
        // visual properties supported by toast-ui Calendar
        // prefer category color for the event card; fall back to status color only when category color is missing/empty
        backgroundColor: preferCategory(categoryColor) ?? statusColor,
        borderColor: preferCategory(categoryColor) ?? statusColor,
        color: textColor,
        dragBackgroundColor: preferCategory(categoryColor) ?? statusColor,
        customStyle: { fontWeight: "700" },
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
          category: (e as any).category ?? null,
          statusColor,
          categoryColor,
        },
        // helper to open edit modal when popup Edit pressed
        onEdit: () => {
          try {
            const raw = (e as any) || {};
            // resolve categoryId robustly from multiple potential sources so backend always receives it
            const resolvedCategoryId = (() => {
              const byEvent = e.categoryId ? String(e.categoryId) : undefined;
              const byRawId =
                raw.category && raw.category.id
                  ? String(raw.category.id)
                  : undefined;
              const byRawCode =
                raw.category && raw.category.code
                  ? String(raw.category.code)
                  : undefined;
              if (byEvent) return byEvent;
              if (byRawId) return byRawId;
              // try to match raw.code against known categories
              if (byRawCode) {
                const found = categories.find(
                  (c) =>
                    String(c.code ?? "") === byRawCode ||
                    String(c.id ?? "") === byRawCode
                );
                if (found) return String(found.id);
              }
              // fallback to first available category
              if (categories && categories.length > 0)
                return String(categories[0].id);
              return "";
            })();

            const draft: import("../schedule-event-modal/schedule-event-modal.form.types").ScheduleEventDraft & {
              id?: string;
            } = {
              id: e.id,
              title: e.title ?? "",
              description: raw.description ?? undefined,
              categoryId: resolvedCategoryId,
              date: e.date,
              startTime: e.startTime ?? "09:00",
              endTime: e.endTime ?? "09:30",
              durationMinutes: (e as any).durationMinutes ?? undefined,
              serviceIds: Array.isArray(raw.services)
                ? raw.services
                    .map((s: any) => s.serviceId ?? s.id)
                    .filter(Boolean)
                : undefined,
              employeeIds: Array.isArray(raw.workers)
                ? raw.workers.map((w: any) => w.userUid ?? w.id).filter(Boolean)
                : undefined,
              totalPriceCents: Array.isArray(raw.services)
                ? raw.services.reduce(
                    (acc: number, s: any) => acc + (s.priceCents ?? 0),
                    0
                  )
                : undefined,
              statusId:
                (raw.status && (raw.status.id ?? raw.status.code)) ?? undefined,
            };

            setModalInitialDraft(draft);
            setModalInitialDate(draft.date);
            setModalInitialStartTime(draft.startTime);
            setIsModalOpen(true);
          } catch (err) {
            void err;
          }
        },
      } as any);
    });

    // build quick lookup map for event -> preferred color (use normalized categoryColor first)
    try {
      const map = new Map<string, string>();
      out.forEach((ev) => {
        const id = ev.id as string;
        const rawCategory = (ev as any).raw?.categoryColor;
        const rawStatus = (ev as any).raw?.statusColor;
        const bgRaw =
          (ev as any).backgroundColor || rawCategory || rawStatus || "";
        const bg = normalizeCssColor(bgRaw) ?? bgRaw;
        if (id && bg) map.set(id, bg as string);
      });
      eventColorMapRef.current = map;
    } catch (err) {
      void err;
    }

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
            // prefer explicit color from the eventColorMap (normalized), then raw values
            const fromMap = eventColorMapRef.current.get(id);
            const categoryColor =
              (ev as any).raw?.categoryColor ||
              (ev as unknown as any).backgroundColor;
            const preferCategory = (c?: string | undefined) =>
              c && String(c).trim() ? c : undefined;
            const preferredColor = fromMap || preferCategory(categoryColor);

            try {
              if (preferredColor) {
                el.style.setProperty(
                  "background-color",
                  preferredColor,
                  "important"
                );
                el.style.background = preferredColor;
                // expose applied color as data attribute for debugging
                el.setAttribute("data-applied-color", preferredColor);
              }
            } catch (err) {
              if (preferredColor) el.style.background = preferredColor;
            }

            // ensure any template popup width is enforced and remove stray max-width
            try {
              const popups =
                document.querySelectorAll<HTMLElement>(".tui-custom-popup");
              popups.forEach((p) => {
                try {
                  p.style.removeProperty("max-width");
                  p.style.setProperty("width", "250px", "important");
                } catch (err) {
                  void err;
                }
              });
            } catch (err) {
              void err;
            }

            const dot = el.querySelector(
              ".toastui-calendar-weekday-event-dot, .tui-custom-dot, .toastui-calendar-monthly-event-dot"
            ) as HTMLElement | null;
            if (dot) {
              try {
                // prefer status color for the dot so it clearly indicates event status
                const dotColorRaw =
                  (ev as any).raw?.statusColor ||
                  (ev as any).raw?.categoryColor ||
                  (ev as any).backgroundColor;
                const dotColor = normalizeCssColor(dotColorRaw) ?? dotColorRaw;
                if (dotColor) {
                  dot.style.setProperty(
                    "background-color",
                    dotColor,
                    "important"
                  );
                  dot.style.background = dotColor;
                }
                // if contrast between dot and category is low, add a thin border to improve visibility
                try {
                  const catCol =
                    (ev as any).raw?.categoryColor ||
                    (ev as any).backgroundColor;
                  const border = suitableBorderForContrast(dotColor, catCol);
                  if (border) {
                    dot.style.setProperty(
                      "border",
                      `2px solid ${border}`,
                      "important"
                    );
                    dot.style.setProperty(
                      "box-sizing",
                      "border-box",
                      "important"
                    );
                  } else {
                    dot.style.removeProperty("border");
                  }
                } catch (err) {
                  // ignore
                }
              } catch (err) {
                const dotColorRaw =
                  (ev as any).raw?.statusColor ||
                  (ev as any).raw?.categoryColor ||
                  (ev as any).backgroundColor;
                const dotColor = normalizeCssColor(dotColorRaw) ?? dotColorRaw;
                if (dotColor) dot.style.background = dotColor;
              }
            }
          });
        });

        try {
          void 0;
        } catch (err) {
          void err;
        }
      } catch (err) {
        void err;
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
      const ev = await api.getEvents({
        from,
        to,
        workspaceId: propWorkspaceId ?? null,
      });
      setEvents(ev);
    }
  };

  useEffect(() => {
    (async () => {
      // prefer categories passed from props (page/sidebar). Only fetch when not provided.
      if (!props.categories) {
        const cats = await api.getCategories();
        setCategories(cats);
      } else {
        // normalize incoming categories to ensure each has a usable, unique color
        // prefer shared category map so calendar and sidebar share the same palette
        const codeColorMap: Record<string, string> = categoryColorMap;
        const palette = [
          "#F59E0B",
          "#06B6D4",
          "#A78BFA",
          "#10B981",
          "#F97316",
          "#EF4444",
          "#0EA5E9",
          "#7C3AED",
        ];

        const used = new Set<string>();
        const mapped = (props.categories ?? []).map((c, idx) => {
          const code = c.code ?? "";
          let chosen =
            c.color ??
            getCategoryColor(code) ??
            codeColorMap[code] ??
            palette[idx % palette.length];
          // normalize CSS variable references to concrete colors
          chosen = normalizeCssColor(chosen) ?? chosen;
          // if exact color already used, pick first unused palette entry
          if (used.has(chosen)) {
            const found = palette.find((p) => !used.has(p));
            if (found) chosen = normalizeCssColor(found) ?? found;
            else {
              const hue = (idx * 47) % 360;
              chosen = `hsl(${hue} 65% 50%)`;
            }
          }
          used.add(chosen);
          return { ...c, color: chosen } as ScheduleCategory;
        });

        // use mapped colors (prefer explicit category color or codeColorMap)
        setCategories(mapped);
        try {
          void 0;
        } catch (err) {
          void err;
        }
      }

      // Only fetch initial events here when parent did not provide `events`.
      if (props.events === undefined) {
        const from = dayjs().startOf("month").format("YYYY-MM-DD");
        const to = dayjs().endOf("month").format("YYYY-MM-DD");
        if (props.onRangeChange) {
          await props.onRangeChange(from, to);
        } else {
          const ev = await api.getEvents({
            from,
            to,
            workspaceId: props.workspaceId ?? null,
          });
          setEvents(ev);
        }
      }
    })();
    // avoid re-running for changing onRangeChange identity - parent should provide stable callback
    // include props.categories so we react when parent provides them
  }, [api, propWorkspaceId, props.categories]);

  useEffect(() => {
    setEvents(propEvents ?? []);
  }, [propEvents]);

  useEffect(() => {
    if (!hostRef.current) return;

    syncHostHeight();

    // create calendar once on mount
    const inst = new Calendar(
      hostRef.current,
      buildCalendarOptions({ viewMode, tuiCalendars, tuiEvents, calendarTheme })
    );

    inst.on("clickEvent", (e: any) => {
      const ev = e?.event;
      if (!ev) {
        return;
      }
      // show React popup anchored to click position
      const dom = e?.domEvent || e?.nativeEvent || null;
      if (dom && wrapRef.current) {
        const rect = wrapRef.current.getBoundingClientRect();
        const clientX =
          dom.clientX ??
          (dom.touches && dom.touches[0] && dom.touches[0].clientX) ??
          null;
        const clientY =
          dom.clientY ??
          (dom.touches && dom.touches[0] && dom.touches[0].clientY) ??
          null;
        if (clientX != null && clientY != null) {
          const x = clientX - rect.left;
          const y = clientY - rect.top;
          setPopupPosition({ left: Math.max(8, x), top: Math.max(8, y) });
        } else {
          // fallback center
          setPopupPosition({
            left: Math.floor(rect.width / 2),
            top: Math.floor(rect.height / 2),
          });
        }
      } else if (wrapRef.current) {
        // fallback: center in calendar
        const rect = wrapRef.current.getBoundingClientRect();
        setPopupPosition({
          left: Math.floor(rect.width / 2),
          top: Math.floor(rect.height / 2),
        });
      }
      // attach an onEdit handler directly to the selected event object so Toast UI's internal cloning
      // won't remove function refs. This opens the edit modal prefilled with the event data.
      try {
        const raw = (ev as any).raw || {};
        const draft: import("../schedule-event-modal/schedule-event-modal.form.types").ScheduleEventDraft & {
          id?: string;
        } = {
          id: ev.id,
          title: ev.title ?? "",
          description: raw.description ?? undefined,
          categoryId:
            (ev as any).calendarId ?? (ev as any).raw?.category?.id ?? "",
          date: raw.date ?? "",
          startTime: raw.startTime ?? "09:00",
          endTime: raw.endTime ?? "09:30",
          durationMinutes: (raw.durationMinutes as number) ?? undefined,
          serviceIds: Array.isArray(raw.services)
            ? raw.services.map((s: any) => s.serviceId ?? s.id).filter(Boolean)
            : undefined,
          employeeIds: Array.isArray(raw.workers)
            ? raw.workers.map((w: any) => w.userUid ?? w.id).filter(Boolean)
            : undefined,
          totalPriceCents: Array.isArray(raw.services)
            ? raw.services.reduce(
                (acc: number, s: any) => acc + (s.priceCents ?? 0),
                0
              )
            : undefined,
          statusId:
            (raw.status && (raw.status.id ?? raw.status.code)) ?? undefined,
        };

        const augmented = {
          ...ev,
          onEdit: () => {
            try {
              setModalInitialDraft(draft);
              setModalInitialDate(draft.date);
              setModalInitialStartTime(draft.startTime);
              setIsModalOpen(true);
              // close popup
              setSelectedEvent(null);
              setPopupPosition(null);
            } catch (err) {
              void err;
            }
          },
        } as any;

        setSelectedEvent(augmented);
      } catch (err) {
        setSelectedEvent(ev);
      }
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

    // After (re)creating the calendar, ensure events for the current range are loaded
    try {
      void loadMonthEventsFromInstance();
    } catch (err) {
      void err;
    }

    // Observe DOM mutations under host and reapply colors when event nodes are added/changed
    let observer: MutationObserver | null = null;
    try {
      const host = hostRef.current;
      observer = new MutationObserver((mutations) => {
        let found = false;
        for (const m of mutations) {
          if (m.addedNodes && m.addedNodes.length > 0) {
            found = true;
            break;
          }
          if (
            m.type === "attributes" &&
            (m as any).attributeName?.includes("data-event")
          ) {
            found = true;
            break;
          }
        }
        if (found) {
          try {
            applyEventDomColors();
          } catch (err) {
            void err;
          }
        }
      });
      observer.observe(host, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["data-event-id"],
      });
    } catch (err) {
      void err;
    }

    return () => {
      instanceRef.current?.destroy?.();
      instanceRef.current = null;
      try {
        observer?.disconnect();
      } catch (err) {
        void err;
      }
    };
    // re-create calendar when `viewMode` changes so handlers/observers are attached correctly
  }, [viewMode]);

  // sync external viewMode prop into internal state so changes from parent take effect
  // NOTE: viewMode is internal to this component; parent no longer controls it.

  // When calendar definitions change (colors/categories), try to update the existing instance
  useEffect(() => {
    const inst = instanceRef.current as any;
    if (!inst) return;
    try {
      // Toast UI Calendar may expose setCalendars/createCalendars - try a few options
      if (typeof inst.setCalendars === "function") {
        inst.setCalendars(tuiCalendars);
      } else if (typeof inst.createCalendars === "function") {
        // remove all then recreate
        try {
          inst.clearCalendars?.();
        } catch (err) {
          void err;
        }
        inst.createCalendars(tuiCalendars);
      } else {
        // fallback: update options and rerender
        try {
          (inst as any).options.calendars = tuiCalendars;
        } catch (err) {
          void err;
        }
      }
      // ensure events & DOM colors are refreshed
      try {
        if (
          typeof inst.clear === "function" &&
          typeof inst.createEvents === "function"
        ) {
          inst.clear();
          if (tuiEvents && tuiEvents.length > 0) inst.createEvents(tuiEvents);
        }
      } catch (err) {
        void err;
      }
      inst.render?.();
      // apply DOM color overrides after a tick
      requestAnimationFrame(() => applyEventDomColors());
      try {
        void 0;
      } catch (err) {
        void err;
      }
    } catch (err) {
      void err;
    }
  }, [tuiCalendars, tuiEvents]);

  // update events on existing instance without recreating the whole calendar
  useEffect(() => {
    const inst = instanceRef.current as any;
    if (!inst) return;

    // prefer instance methods to update events in-place
    try {
      if (
        typeof inst.clear === "function" &&
        typeof inst.createEvents === "function"
      ) {
        inst.clear();
        if (tuiEvents && tuiEvents.length > 0) inst.createEvents(tuiEvents);
        inst.render?.();
        refreshHeaderLabel();
        // ensure DOM nodes receive color styles
        applyEventDomColors();
        return;
      }
    } catch (err) {
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
      const next = new Calendar(
        host,
        buildCalendarOptions({
          viewMode,
          tuiCalendars,
          tuiEvents,
          calendarTheme,
        })
      );
      if (prevDate) {
        try {
          (next as any).setDate?.(prevDate);
        } catch (err) {
          void err;
        }
      }
      instanceRef.current = next;
      refreshHeaderLabel();
      safeRender();
      // apply colors after recreate
      applyEventDomColors();
      // styling handled via styled-components in CalendarHost
    } catch (err) {
      // ScheduleCalendar: failed to update events
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
      const btn = target.closest(
        ".tui-custom-popup-delete"
      ) as HTMLElement | null;
      if (!btn) return;
      // find nearest popup container
      const popup = btn.closest(".tui-custom-popup") as HTMLElement | null;
      if (!popup) return;

      // attempt to find event id: check data-event-id on siblings or searched elements
      let id: string | null = null;
      // look for attribute on popup or parent nodes
      let node: HTMLElement | null = popup;
      while (node && !id) {
        if (node.hasAttribute && node.hasAttribute("data-event-id")) {
          id = node.getAttribute("data-event-id");
          break;
        }
        node = node.parentElement;
      }

      // fallback: match by title text inside popup
      if (!id) {
        const titleEl = popup.querySelector(".tui-custom-popup-title");
        const titleText = titleEl ? (titleEl.textContent?.trim() ?? "") : "";
        if (titleText) {
          const found = (eventsRef.current || events).find(
            (e) => e.title === titleText
          );
          if (found) id = found.id;
        }
      }

      if (!id) {
        message.error("Could not determine event to delete");
        return;
      }

      try {
        loadingService.show();
        const ok = await api.removeEvent(id);
        if (ok) {
          try {
            await loadMonthEventsFromInstance();
          } catch (e) {
            void e;
          }
          message.success("Event deleted");
        } else {
          message.error("Failed to delete event");
        }
      } catch (err) {
        // delete event failed
        message.error("Failed to delete event");
      } finally {
        loadingService.hide();
        setSelectedEvent(null);
        setPopupPosition(null);
      }
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [events, api]);

  // debug popup state changes
  useEffect(() => {}, [selectedEvent, popupPosition]);
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
        el.style.removeProperty("max-width");
        el.style.setProperty("width", "250px", "important");
      } catch (err) {
        void err;
      }
    };

    const scanAndFix = () => {
      try {
        const popups =
          document.querySelectorAll<HTMLElement>(".tui-custom-popup");
        popups.forEach((p) => enforcePopup(p));
      } catch (err) {
        void err;
      }
    };

    // initial scan
    scanAndFix();

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "childList" && m.addedNodes && m.addedNodes.length) {
          m.addedNodes.forEach((n) => {
            try {
              if (!(n instanceof HTMLElement)) return;
              if (n.classList && n.classList.contains("tui-custom-popup"))
                enforcePopup(n as HTMLElement);
              // if the added node contains popups deeper
              const inner =
                n.querySelectorAll && n.querySelectorAll(".tui-custom-popup");
              if (inner && inner.length)
                inner.forEach((el: any) => enforcePopup(el as HTMLElement));
            } catch (err) {
              void err;
            }
          });
        }
        if (m.type === "attributes" && m.target instanceof HTMLElement) {
          const t = m.target as HTMLElement;
          if (t.classList && t.classList.contains("tui-custom-popup"))
            enforcePopup(t);
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });

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
    setModalInitialDraft(undefined);
  };

  const handleConfirmModal = async (draft: ScheduleEventDraft) => {
    const toCreate: Omit<ScheduleEvent, "id"> & {
      durationMinutes?: number | null;
    } = {
      title: draft.title,
      date: draft.date,
      startTime: draft.startTime,
      endTime: draft.endTime,
      categoryId: draft.categoryId,
      description: draft.description,
      durationMinutes: draft.durationMinutes ?? null,
    };

    // include statusId when provided by the modal draft so backend receives updated status
    try {
      if ((draft as any).statusId)
        (toCreate as any).statusId = (draft as any).statusId;
    } catch (err) {
      // no-op
    }

    try {
      loadingService.show();
      // if editing an existing draft, delegate to page-level update handler
      if (modalInitialDraft && modalInitialDraft.id) {
        if (props.onUpdate) {
          await props.onUpdate({
            id: modalInitialDraft.id,
            event: toCreate,
            serviceIds: draft.serviceIds,
            employeeIds: draft.employeeIds,
            totalPriceCents: draft.totalPriceCents,
            workspaceId: propWorkspaceId ?? null,
          });
        } else {
          // fallback to calling api.updateEvent directly
          if ((api as any).updateEvent) {
            await (api as any).updateEvent({
              id: modalInitialDraft.id,
              event: toCreate,
              serviceIds: draft.serviceIds,
              employeeIds: draft.employeeIds,
              totalPriceCents: draft.totalPriceCents,
              workspaceId: propWorkspaceId ?? null,
            });
          } else {
            void 0;
          }
        }
      } else {
        // delegate creation to page via props.onCreate
        if (propOnCreate) {
          await propOnCreate(draft);
        } else {
          // fallback to local create if no handler provided
          await api.createSchedule({
            event: toCreate,
            serviceIds: draft.serviceIds,
            employeeIds: draft.employeeIds,
            totalPriceCents: draft.totalPriceCents,
            workspaceId: propWorkspaceId ?? null,
          });
        }
      }

      // refresh month events
      const inst = instanceRef.current as any;
      const current = inst?.getDate?.();
      const from = dayjs(current).startOf("month").format("YYYY-MM-DD");
      const to = dayjs(current).endOf("month").format("YYYY-MM-DD");
      if (propOnRangeChange) {
        await propOnRangeChange(from, to);
      } else {
        const ev = await api.getEvents({
          from,
          to,
          workspaceId: propWorkspaceId ?? null,
        });
        setEvents(ev);
      }

      message.success(
        modalInitialDraft && modalInitialDraft.id
          ? "Schedule updated"
          : "Schedule created"
      );
      setIsModalOpen(false);
      setModalInitialDraft(undefined);
    } catch (err) {
      // create/update schedule failed
      message.error("Failed to create schedule");
    } finally {
      loadingService.hide();
    }
  };

  return (
    <>
      <ToastUIGlobalStyles />
      <CalendarShell>
        <ToolbarRow style={{ flexDirection: "column", alignItems: "stretch" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CalendarIcon size={20} />
              <Typography.Title level={3} style={{ margin: 0 }}>
                {headerLabel}
              </Typography.Title>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
              <Input
                value={search}
                onChange={(ev) => setSearch(ev.target.value)}
                placeholder="Search events..."
                prefix={<Search size={16} />}
                style={{ width: 220 }}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Button icon={<ChevronLeft size={18} />} onClick={handlePrev} />
              <Button icon={<ChevronRight size={18} />} onClick={handleNext} />
              <Button onClick={handleToday}>Today</Button>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
              <div
                style={{
                  borderRadius: "var(--radius-sm)",
                  overflow: "hidden",
                  boxSizing: "border-box",
                  padding: 2,
                  background: "transparent",
                }}
              >
                <Segmented
                  value={viewMode}
                  onChange={(v) => setViewMode(String(v))}
                  options={[
                    { label: "Month", value: "month" },
                    { label: "Week", value: "week" },
                    { label: "Day", value: "day" },
                  ]}
                />
              </div>
            </div>
          </div>
        </ToolbarRow>

        <CalendarWrap ref={wrapRef}>
          <CalendarHost ref={hostRef} />

          {/* React-controlled popup rendered inside the calendar wrap so it inherits theme */}
          {selectedEvent && popupPosition ? (
            <ScheduleEventPopup
              event={selectedEvent}
              position={popupPosition}
              onClose={() => {
                setSelectedEvent(null);
                setPopupPosition(null);
              }}
              onDeleted={async () => {
                try {
                  await loadMonthEventsFromInstance();
                } catch (e) {
                  void e;
                }
              }}
              categories={categories.map((c) => ({
                ...c,
                color: c.color ?? "var(--color-surface)",
              }))}
              loadMonthEventsFromInstance={loadMonthEventsFromInstance}
            />
          ) : null}
        </CalendarWrap>
      </CalendarShell>

      <ScheduleEventModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmModal}
        categories={categories.map((c) => ({
          ...c,
          color: c.color ?? "var(--color-surface)",
        }))}
        initialDate={modalInitialDate}
        initialStartTime={modalInitialStartTime}
        initialDraft={modalInitialDraft}
        availableServices={propAvailableServices}
        availableEmployees={propAvailableEmployees}
        statuses={
          props.statuses
            ? props.statuses.map((s: any) => ({
                id: String(s.id),
                code: s.code,
                label: s.label,
              }))
            : undefined
        }
      />
    </>
  );
}
