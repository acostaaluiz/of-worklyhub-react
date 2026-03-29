/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Input, Segmented, Typography, message } from "antd";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight, Search, Calendar as CalendarIcon } from "lucide-react";
import { formatDateTime } from "@core/utils/mask";

import Calendar from "@toast-ui/calendar";
import type { EventObject } from "@toast-ui/calendar";

import { useScheduleApi } from "../../../services/schedule.service";
import { loadingService } from "@shared/ui/services/loading.service";
import type { ScheduleCategory } from "../../../interfaces/schedule-category.model";
import type { ScheduleEvent } from "../../../interfaces/schedule-event.model";

import {
  CalendarShell,
  MonthHintActions,
  MonthHintBanner,
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
import ScheduleEventPopup, {
  type SchedulePopupEvent,
} from "./schedule-event-popup.component";
import {
  normalizeCssColor,
  escapeHtml,
  buildCalendarOptions,
} from "./schedule-calendar.factory";
import type { ScheduleEventDraft } from "../schedule-event-modal/schedule-event-modal.form.types";
import type { CompanyServiceModel } from "@modules/company/interfaces/service.model";
import type { EmployeeModel } from "@modules/people/interfaces/employee.model";
import type { InventoryItem } from "@modules/inventory/services/inventory-api";
import { i18n as appI18n } from "@core/i18n";
import type { InventoryItemLine } from "../../../interfaces/schedule-event.model";
import type {
  MonthViewHint,
  ScheduleStatus,
} from "@modules/schedule/services/schedules-api";
import type { ScheduleWorkspaceSettings } from "@modules/schedule/interfaces/schedule-settings.model";

type ScheduleCalendarProps = {
  availableServices?: CompanyServiceModel[];
  availableEmployees?: EmployeeModel[];
  availableInventoryItems?: InventoryItem[];
  workspaceId?: string | null;
  onCreate?: (
    draft: ScheduleEventDraft
  ) => Promise<void>;
  onUpdate?: (args: {
    id: string;
    event: Omit<
      ScheduleEvent,
      "id"
    >;
    serviceIds?: string[];
    employeeIds?: string[];
    totalPriceCents?: number;
    workspaceId?: string | null;
    inventoryInputs?: InventoryItemLine[];
    inventoryOutputs?: InventoryItemLine[];
  }) => Promise<void>;
  events?: ScheduleEvent[];
  onRangeChange?: (
    from: string,
    to: string,
    options?: {
      viewMode?: "month" | "week" | "day";
      includeViewHint?: boolean;
    }
  ) => Promise<ScheduleEvent[] | void>;
  monthViewHint?: MonthViewHint | null;
  categories?: ScheduleCategory[] | null;
  statuses?: ScheduleStatus[] | null;
  settings?: ScheduleWorkspaceSettings;
  // internal view mode only; parent no longer controls it
};

type EventCategoryRef = {
  id?: string;
  code?: string;
  label?: string;
  color?: string;
};

type EventStatusRef = {
  id?: string;
  code?: string;
  label?: string;
  color?: string;
};

type EventServiceRef = {
  serviceId?: string;
  id?: string;
  priceCents?: number;
};

type EventWorkerRef = {
  userUid?: string;
  id?: string;
  email?: string;
  fullName?: string;
};

type EventInventoryRef = {
  itemId?: string;
  id?: string;
  inventoryItemId?: string;
  item_id?: string;
  productId?: string;
  quantity?: number | string;
};

type ScheduleEventExtended = ScheduleEvent & {
  category?: EventCategoryRef | null;
  status?: EventStatusRef | null;
  services?: EventServiceRef[] | null;
  workers?: EventWorkerRef[] | null;
  inventoryInputs?: EventInventoryRef[] | null;
  inventoryOutputs?: EventInventoryRef[] | null;
  durationMinutes?: number | null;
};

type PopupRawData = {
  description?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number | null;
  services?: EventServiceRef[] | null;
  workers?: EventWorkerRef[] | null;
  inventoryInputs?: EventInventoryRef[] | null;
  inventoryOutputs?: EventInventoryRef[] | null;
  inventoryInputsText?: string;
  inventoryOutputsText?: string;
  _bodyHtml?: string;
  status?: EventStatusRef | null;
  category?: EventCategoryRef | null;
  statusColor?: string;
  categoryColor?: string;
};

type TuiScheduleEvent = EventObject &
  SchedulePopupEvent & {
    raw?: PopupRawData;
    category?: string;
    body?: string;
    color?: string;
    borderColor?: string;
    dragBackgroundColor?: string;
    customStyle?: Record<string, string>;
  };

type PointerEventLike = {
  clientX?: number;
  clientY?: number;
  touches?: Array<{ clientX?: number; clientY?: number }>;
};

type CalendarClickPayload = {
  event?: TuiScheduleEvent;
  domEvent?: PointerEventLike | null;
  nativeEvent?: PointerEventLike | null;
};

type SelectDateTimePayload = {
  start?: Date | string;
};

type CalendarViewMode = "month" | "week" | "day";

type CalendarInstance = Calendar & {
  render?: () => void;
  createEvents?: (events: EventObject[]) => void;
  createCalendars?: (
    calendars: Array<{
      id: string;
      name: string;
      backgroundColor?: string;
      borderColor?: string;
      color?: string;
    }>
  ) => void;
  clearCalendars?: () => void;
  setDate?: (date: Date) => void;
  options?: {
    calendars?: Array<{
      id: string;
      name: string;
      backgroundColor?: string;
      borderColor?: string;
      color?: string;
    }>;
  };
};

export function ScheduleCalendar(props: ScheduleCalendarProps) {
        const api = useScheduleApi();

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<CalendarInstance | null>(null);
  const eventColorMapRef = useRef<Map<string, string>>(new Map());
  const tuiEventsRef = useRef<TuiScheduleEvent[]>([]);
  const seeMoreAnchorRectRef = useRef<DOMRect | null>(null);

  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [headerLabel, setHeaderLabel] = useState<string>(
    dayjs().format("MMMM YYYY")
  );
  const [currentMonthKey, setCurrentMonthKey] = useState<string>(
    dayjs().format("YYYY-MM")
  );
  const [dismissedHintMonthKey, setDismissedHintMonthKey] = useState<
    string | null
  >(null);
  const [localMonthViewHint, setLocalMonthViewHint] = useState<MonthViewHint | null>(
    null
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
    | (ScheduleEventDraft & { id?: string })
    | undefined
  >(undefined);

  // React-controlled popup state (replacement for native detail popup)
  const [selectedEvent, setSelectedEvent] = useState<SchedulePopupEvent | null>(
    null
  );
  const [popupPosition, setPopupPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);

  const {
    events: propEvents,
    workspaceId: propWorkspaceId,
    onRangeChange: propOnRangeChange,
    monthViewHint: propMonthViewHint,
    onCreate: propOnCreate,
    availableServices: propAvailableServices,
    availableEmployees: propAvailableEmployees,
    availableInventoryItems: propAvailableInventoryItems,
    settings: propSettings,
  } = props;

  const activeMonthViewHint = propMonthViewHint ?? localMonthViewHint;
  const shouldShowMonthHint =
    viewMode === "month" &&
    Boolean(activeMonthViewHint?.shouldSuggestDayWeekView) &&
    Number(activeMonthViewHint?.totalHiddenEvents ?? 0) > 0 &&
    dismissedHintMonthKey !== currentMonthKey;

  const inventoryNameMap = useMemo(() => {
    const map = new Map<string, string>();
    (propAvailableInventoryItems ?? []).forEach((item) => {
      if (item?.id) map.set(item.id, item.name ?? item.id);
    });
    return map;
  }, [propAvailableInventoryItems]);

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

  const tuiEvents = useMemo<TuiScheduleEvent[]>(() => {
    const out: TuiScheduleEvent[] = [];
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
      const event = e as ScheduleEventExtended;
      const start = dayjs(`${e.date}T${e.startTime}`).toDate();
      const end = dayjs(`${e.date}T${e.endTime}`).toDate();

      if (!start || Number.isNaN(start.getTime())) {
        return;
      }

      if (!end || Number.isNaN(end.getTime())) {
        return;
      }

      // match category by stringified id to avoid mismatches (number vs string)
      // also try matching by category object or by category code to cover responses
      // that return codes instead of ids or embed the category object only.
      const rawCat: EventCategoryRef | null = event.category ?? null;
      const category = categories.find((c) => {
        const cid = String(c.id ?? "");
        const ccode = String(c.code ?? "");
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
        normalizeCssColor(rawCategoryColor) ??
        normalizeCssColor(themePrimary) ??
        "#1e70ff";
      const statusCode = event?.status?.code ?? null;
      const statusColorRaw = statusCode
        ? (getStatusColor(statusCode) ?? themePrimary ?? "#7c3aed")
        : undefined;
      const statusColor =
        normalizeCssColor(statusColorRaw) ??
        normalizeCssColor(themePrimary) ??
        categoryColor;
      const textColor = themeOnPrimary || themeText || "#ffffff";

      const startText = formatDateTime(start);
      const endText = dayjs(end).format("HH:mm");
      const inventoryInputsRaw = event.inventoryInputs ?? null;
      const inventoryOutputsRaw = event.inventoryOutputs ?? null;
      const inventoryInputsText = Array.isArray(inventoryInputsRaw)
        ? inventoryInputsRaw
            .map((l: EventInventoryRef) => {
              const iid = l?.itemId ?? l?.id ?? "";
              if (!iid) return null;
              const name = inventoryNameMap.get(String(iid)) ?? String(iid);
              const qty =
                l?.quantity && Number(l.quantity) !== 1
                  ? ` x${Number(l.quantity)}`
                  : "";
              return `${name}${qty}`;
            })
            .filter((line): line is string => Boolean(line))
            .join(", ")
        : "";
      const inventoryOutputsText = Array.isArray(inventoryOutputsRaw)
        ? inventoryOutputsRaw
            .map((l: EventInventoryRef) => {
              const iid = l?.itemId ?? l?.id ?? "";
              if (!iid) return null;
              const name = inventoryNameMap.get(String(iid)) ?? String(iid);
              const qty =
                l?.quantity && Number(l.quantity) !== 1
                  ? ` x${Number(l.quantity)}`
                  : "";
              return `${name}${qty}`;
            })
            .filter((line): line is string => Boolean(line))
            .join(", ")
        : "";
      const bodyHtml = `
        <div style="background:var(--color-surface);color:var(--color-text);border:1px solid var(--color-border);box-shadow:var(--shadow-md);border-radius:8px;padding:12px;width:min(250px,calc(100vw - 24px));font-family:inherit;overflow:hidden;">
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
        calendarId: String(event.category?.id ?? e.categoryId),
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
          services: event.services ?? null,
          workers: event.workers ?? null,
          inventoryInputs: inventoryInputsRaw ?? null,
          inventoryOutputs: inventoryOutputsRaw ?? null,
          inventoryInputsText,
          inventoryOutputsText,
          _bodyHtml: bodyHtml,
          status: event.status ?? null,
          category: event.category ?? null,
          statusColor,
          categoryColor,
        },
        // helper to open edit modal when popup Edit pressed
        onEdit: () => {
          try {
            const raw = event || {};
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

            const draft: ScheduleEventDraft & {
              id?: string;
            } = {
              id: e.id,
              title: e.title ?? "",
              description: raw.description ?? undefined,
              categoryId: resolvedCategoryId,
              date: e.date,
              startTime: e.startTime ?? "09:00",
              endTime: e.endTime ?? "09:30",
              durationMinutes: event.durationMinutes ?? undefined,
              serviceIds: Array.isArray(raw.services)
                ? raw.services
                    .map((s: EventServiceRef) => s.serviceId ?? s.id ?? null)
                    .filter((id): id is string => Boolean(id))
                : undefined,
              employeeIds: Array.isArray(raw.workers)
                ? raw.workers
                    .map((w: EventWorkerRef) => w.userUid ?? w.id ?? null)
                    .filter((id): id is string => Boolean(id))
                : undefined,
              inventoryInputs: Array.isArray(raw.inventoryInputs)
                ? raw.inventoryInputs
                    .map((l: EventInventoryRef) => {
                      const iid =
                        l?.itemId ??
                        l?.id ??
                        l?.inventoryItemId ??
                        l?.item_id ??
                        l?.productId;
                      if (!iid) return null;
                      const quantity =
                        typeof l?.quantity === "number"
                          ? l.quantity
                          : l?.quantity
                          ? Number(l.quantity)
                          : undefined;
                      const line: InventoryItemLine = {
                        itemId: String(iid),
                      };
                      if (quantity !== undefined) line.quantity = quantity;
                      return line;
                    })
                    .filter(
                      (line): line is InventoryItemLine => Boolean(line)
                    )
                : undefined,
              inventoryOutputs: Array.isArray(raw.inventoryOutputs)
                ? raw.inventoryOutputs
                    .map((l: EventInventoryRef) => {
                      const iid =
                        l?.itemId ??
                        l?.id ??
                        l?.inventoryItemId ??
                        l?.item_id ??
                        l?.productId;
                      if (!iid) return null;
                      const quantity =
                        typeof l?.quantity === "number"
                          ? l.quantity
                          : l?.quantity
                          ? Number(l.quantity)
                          : undefined;
                      const line: InventoryItemLine = {
                        itemId: String(iid),
                      };
                      if (quantity !== undefined) line.quantity = quantity;
                      return line;
                    })
                    .filter(
                      (line): line is InventoryItemLine => Boolean(line)
                    )
                : undefined,
              totalPriceCents: Array.isArray(raw.services)
                ? raw.services.reduce(
                    (acc: number, s: EventServiceRef) =>
                      acc + Number(s.priceCents ?? 0),
                    0
                  )
                : undefined,
              statusId: (raw.status && raw.status.id) ?? undefined,
            };

            setModalInitialDraft(draft);
            setModalInitialDate(draft.date);
            setModalInitialStartTime(draft.startTime);
            setIsModalOpen(true);
          } catch (err) {
            void err;
          }
        },
      });
    });

    // build quick lookup map for event -> preferred color (use normalized categoryColor first)
    try {
      const map = new Map<string, string>();
      out.forEach((ev) => {
        const id = ev.id as string;
        const rawCategory = (ev as TuiScheduleEvent).raw?.categoryColor;
        const rawStatus = (ev as TuiScheduleEvent).raw?.statusColor;
        const bgRaw =
          (ev as TuiScheduleEvent).backgroundColor || rawCategory || rawStatus || "";
        const bg = normalizeCssColor(bgRaw);
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
        const latestTuiEvents = tuiEventsRef.current;
        latestTuiEvents.forEach((ev) => {
          const id = ev.id as string;
          if (!id) return;
          const hostNodes = Array.from(
            host.querySelectorAll<HTMLElement>(`[data-event-id="${id}"]`)
          );
          const globalNodes =
            typeof document !== "undefined"
              ? Array.from(
                  document.querySelectorAll<HTMLElement>(
                    `[data-event-id="${id}"]`
                  )
                )
              : [];
          const nodes = Array.from(
            new Set<HTMLElement>([...hostNodes, ...globalNodes])
          );
          nodes.forEach((n) => {
            const el = n as HTMLElement;
            // prefer explicit color from the eventColorMap (normalized), then raw values
            const fromMap = eventColorMapRef.current.get(id);
            const categoryColor =
              (ev as TuiScheduleEvent).raw?.categoryColor ||
              (ev as TuiScheduleEvent).backgroundColor;
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

                const body = el.querySelector(
                  ".toastui-calendar-weekday-event"
                ) as HTMLElement | null;
                if (body) {
                  body.style.setProperty(
                    "background-color",
                    preferredColor,
                    "important"
                  );
                  body.style.background = preferredColor;
                  body.style.setProperty(
                    "border-left-color",
                    preferredColor,
                    "important"
                  );
                  body.style.setProperty("opacity", "1", "important");
                }
              }
            } catch (err) {
              if (preferredColor) el.style.background = preferredColor;
            }

            // ensure DataMap template popup width is enforced and remove stray max-width
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
                  (ev as TuiScheduleEvent).raw?.statusColor ||
                  (ev as TuiScheduleEvent).raw?.categoryColor ||
                  (ev as TuiScheduleEvent).backgroundColor;
                const dotColor = normalizeCssColor(dotColorRaw) ?? preferredColor;
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
                    (ev as TuiScheduleEvent).raw?.categoryColor ||
                    (ev as TuiScheduleEvent).backgroundColor;
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
                  (ev as TuiScheduleEvent).raw?.statusColor ||
                  (ev as TuiScheduleEvent).raw?.categoryColor ||
                  (ev as TuiScheduleEvent).backgroundColor;
                const dotColor = normalizeCssColor(dotColorRaw) ?? preferredColor;
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
    const inst = instanceRef.current;
    if (!inst) return;

    syncHostHeight();

    const doRender = () => inst.render?.();

    requestAnimationFrame(() => {
      doRender();
      requestAnimationFrame(() => doRender());
    });
  };

  useEffect(() => {
    tuiEventsRef.current = tuiEvents;
  }, [tuiEvents]);

  const refreshHeaderLabel = () => {
    const inst = instanceRef.current;
    if (!inst) return;

    const current = inst.getDate?.();
    if (!current) return;

    setHeaderLabel(dayjs(current).format("MMMM YYYY"));
    setCurrentMonthKey(dayjs(current).format("YYYY-MM"));
  };

  const loadMonthEventsFromInstance = async () => {
    const inst = instanceRef.current;
    if (!inst) return;

    const current = inst.getDate?.();
    if (!current) return;

    const from = dayjs(current).startOf("month").format("YYYY-MM-DD");
    const to = dayjs(current).endOf("month").format("YYYY-MM-DD");
    if (propOnRangeChange) {
      await propOnRangeChange(from, to, {
        viewMode: viewMode === "week" || viewMode === "day" ? viewMode : "month",
        includeViewHint: viewMode === "month",
      });
    } else {
      const range = await api.getEventsWithHint({
        from,
        to,
        workspaceId: propWorkspaceId ?? null,
        calendarView: viewMode === "week" || viewMode === "day" ? viewMode : "month",
        includeViewHint: viewMode === "month",
        monthCellVisibleLimit: 2,
        monthViewTimeZone: "America/Sao_Paulo",
      });
      setEvents(range.events ?? []);
      setLocalMonthViewHint(range.monthViewHint ?? null);
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
          chosen = normalizeCssColor(chosen) ?? palette[idx % palette.length];
          // if exact color already used, pick first unused palette entry
          if (used.has(chosen)) {
            const found = palette.find((p) => !used.has(p));
            chosen = found ? normalizeCssColor(found) ?? found : palette[idx % palette.length];
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
      if (props.events === undefined && !props.onRangeChange) {
        const from = dayjs().startOf("month").format("YYYY-MM-DD");
        const to = dayjs().endOf("month").format("YYYY-MM-DD");
        const range = await api.getEventsWithHint({
          from,
          to,
          workspaceId: props.workspaceId ?? null,
          calendarView: "month",
          includeViewHint: true,
          monthCellVisibleLimit: 2,
          monthViewTimeZone: "America/Sao_Paulo",
        });
        setEvents(range.events ?? []);
        setLocalMonthViewHint(range.monthViewHint ?? null);
      }
    })();
    // avoid re-running for changing onRangeChange identity - parent should provide stable callback
    // include props.categories so we react when parent provides them
  }, [api, propWorkspaceId, props.categories, props.onRangeChange, props.events]);

  useEffect(() => {
    setEvents(propEvents ?? []);
  }, [propEvents]);

  useEffect(() => {
    if (!dismissedHintMonthKey) return;
    if (dismissedHintMonthKey === currentMonthKey) return;
    setDismissedHintMonthKey(null);
  }, [currentMonthKey, dismissedHintMonthKey]);

  useEffect(() => {
    if (!hostRef.current) return;

    syncHostHeight();

    // create calendar once on mount
    const inst = new Calendar(
      hostRef.current,
      buildCalendarOptions({ viewMode, tuiCalendars, tuiEvents, calendarTheme })
    ) as CalendarInstance;

    inst.on("clickEvent", (e: CalendarClickPayload) => {
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
        const raw = (ev as TuiScheduleEvent).raw ?? {};
        const draft: ScheduleEventDraft & {
          id?: string;
        } = {
          id: ev.id,
          title: ev.title ?? "",
          description: raw.description ?? undefined,
          categoryId:
            (ev as TuiScheduleEvent).calendarId ?? (ev as TuiScheduleEvent).raw?.category?.id ?? "",
          date: raw.date ?? "",
          startTime: raw.startTime ?? "09:00",
          endTime: raw.endTime ?? "09:30",
          durationMinutes: (raw.durationMinutes as number) ?? undefined,
          serviceIds: Array.isArray(raw.services)
            ? raw.services
                .map((s: EventServiceRef) => s.serviceId ?? s.id ?? null)
                .filter((id): id is string => Boolean(id))
            : undefined,
          employeeIds: Array.isArray(raw.workers)
            ? raw.workers
                .map((w: EventWorkerRef) => w.userUid ?? w.id ?? null)
                .filter((id): id is string => Boolean(id))
            : undefined,
          inventoryInputs: Array.isArray(raw.inventoryInputs)
            ? raw.inventoryInputs
                .map((l: EventInventoryRef) => {
                  const iid =
                    l?.itemId ??
                    l?.id ??
                    l?.inventoryItemId ??
                    l?.item_id ??
                    l?.productId;
                  if (!iid) return null;
                  const quantity =
                    typeof l?.quantity === "number"
                      ? l.quantity
                      : l?.quantity
                      ? Number(l.quantity)
                      : undefined;
                  const line: InventoryItemLine = {
                    itemId: String(iid),
                  };
                  if (quantity !== undefined) line.quantity = quantity;
                  return line;
                })
                .filter(
                  (line): line is InventoryItemLine => Boolean(line)
                )
            : undefined,
          inventoryOutputs: Array.isArray(raw.inventoryOutputs)
            ? raw.inventoryOutputs
                .map((l: EventInventoryRef) => {
                  const iid =
                    l?.itemId ??
                    l?.id ??
                    l?.inventoryItemId ??
                    l?.item_id ??
                    l?.productId;
                  if (!iid) return null;
                  const quantity =
                    typeof l?.quantity === "number"
                      ? l.quantity
                      : l?.quantity
                      ? Number(l.quantity)
                      : undefined;
                  const line: InventoryItemLine = {
                    itemId: String(iid),
                  };
                  if (quantity !== undefined) line.quantity = quantity;
                  return line;
                })
                .filter(
                  (line): line is InventoryItemLine => Boolean(line)
                )
            : undefined,
          totalPriceCents: Array.isArray(raw.services)
            ? raw.services.reduce(
                (acc: number, s: EventServiceRef) =>
                  acc + Number(s.priceCents ?? 0),
                0
              )
            : undefined,
          statusId: (raw.status && raw.status.id) ?? undefined,
        };

        const augmented: SchedulePopupEvent = {
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
        };

        setSelectedEvent(augmented);
      } catch (err) {
        setSelectedEvent(ev);
      }
    });

    inst.on("selectDateTime", (e: SelectDateTimePayload) => {
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
    // Only trigger here when the calendar owns its data fetching.
    if (!props.onRangeChange && props.events === undefined) {
      try {
        void loadMonthEventsFromInstance();
      } catch (err) {
        void err;
      }
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
            m.attributeName?.includes("data-event")
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
    const inst = instanceRef.current;
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
          const instWithOptions = inst as Calendar & {
            options?: { calendars?: typeof tuiCalendars };
          };
          if (instWithOptions.options) {
            instWithOptions.options.calendars = tuiCalendars;
          }
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
    const inst = instanceRef.current;
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
      ) as CalendarInstance;
      if (prevDate) {
        try {
          next.setDate?.(prevDate);
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

  // Re-anchor Toast UI month "x more" popup to the clicked button to avoid
  // scroll-offset drift that moves it far away and expands the layout.
  useEffect(() => {
    const captureAnchor = (ev: MouseEvent) => {
      const target = ev.target as HTMLElement | null;
      if (!target) return;
      const moreBtn = target.closest(
        ".toastui-calendar-grid-cell-more-events"
      ) as HTMLElement | null;
      if (!moreBtn) return;
      seeMoreAnchorRectRef.current = moreBtn.getBoundingClientRect();
    };

    const repositionSeeMore = () => {
      const wrap = wrapRef.current;
      if (!wrap) return;

      const popup =
        wrap.querySelector<HTMLElement>(".toastui-calendar-see-more-container") ??
        document.querySelector<HTMLElement>(".toastui-calendar-see-more-container");
      if (!popup) return;

      const anchorRect = seeMoreAnchorRectRef.current;
      if (!anchorRect) return;

      const offsetParent =
        popup.offsetParent instanceof HTMLElement ? popup.offsetParent : wrap;
      const parentRect = offsetParent.getBoundingClientRect();
      const parentWidth = Math.max(0, offsetParent.clientWidth || wrap.clientWidth);
      const parentHeight = Math.max(
        0,
        offsetParent.clientHeight || wrap.clientHeight
      );
      if (!parentWidth || !parentHeight) return;

      const popupWidth = popup.offsetWidth || 320;
      const popupHeight = popup.offsetHeight || 320;
      const margin = 8;

      let left = anchorRect.left - parentRect.left;
      let top = anchorRect.bottom - parentRect.top + 6;

      if (left + popupWidth + margin > parentWidth) {
        left = parentWidth - popupWidth - margin;
      }
      if (left < margin) left = margin;

      if (top + popupHeight + margin > parentHeight) {
        const aboveTop = anchorRect.top - parentRect.top - popupHeight - 6;
        top = aboveTop >= margin ? aboveTop : parentHeight - popupHeight - margin;
      }
      if (top < margin) top = margin;

      popup.style.setProperty("position", "absolute", "important");
      popup.style.setProperty("left", `${Math.round(left)}px`, "important");
      popup.style.setProperty("top", `${Math.round(top)}px`, "important");
      popup.style.removeProperty("right");
      popup.style.removeProperty("bottom");
    };

    const triggerReposition = (ev: MouseEvent) => {
      const target = ev.target as HTMLElement | null;
      if (!target) return;
      const moreBtn = target.closest(
        ".toastui-calendar-grid-cell-more-events"
      ) as HTMLElement | null;
      if (!moreBtn) return;
      requestAnimationFrame(() => {
        repositionSeeMore();
        applyEventDomColors();
        requestAnimationFrame(repositionSeeMore);
      });
    };

    const observer = new MutationObserver(() => {
      repositionSeeMore();
      applyEventDomColors();
    });

    document.addEventListener("mousedown", captureAnchor, true);
    document.addEventListener("click", triggerReposition, true);
    window.addEventListener("resize", repositionSeeMore);
    window.addEventListener("scroll", repositionSeeMore, true);

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("mousedown", captureAnchor, true);
      document.removeEventListener("click", triggerReposition, true);
      window.removeEventListener("resize", repositionSeeMore);
      window.removeEventListener("scroll", repositionSeeMore, true);
      observer.disconnect();
    };
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
        message.error(appI18n.t("legacyInline.schedule.presentation_components_schedule_calendar_schedule_calendar_component.k001"));
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
          message.success(appI18n.t("legacyInline.schedule.presentation_components_schedule_calendar_schedule_calendar_component.k002"));
        } else {
          message.error(appI18n.t("legacyInline.schedule.presentation_components_schedule_calendar_schedule_calendar_component.k003"));
        }
      } catch (err) {
        // delete event failed
        message.error(appI18n.t("legacyInline.schedule.presentation_components_schedule_calendar_schedule_calendar_component.k004"));
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
                inner.forEach((el) => enforcePopup(el as HTMLElement));
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
    const inst = instanceRef.current;
    if (!inst) return;
    inst.prev();
    refreshHeaderLabel();
    await loadMonthEventsFromInstance();
    safeRender();
  };

  const handleNext = async () => {
    const inst = instanceRef.current;
    if (!inst) return;
    inst.next();
    refreshHeaderLabel();
    await loadMonthEventsFromInstance();
    safeRender();
  };

  const handleToday = async () => {
    const inst = instanceRef.current;
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
      statusId?: string;
    } = {
      title: draft.title,
      date: draft.date,
      startTime: draft.startTime,
      endTime: draft.endTime,
      categoryId: draft.categoryId,
      description: draft.description,
      durationMinutes: draft.durationMinutes ?? null,
      inventoryInputs: draft.inventoryInputs ?? undefined,
      inventoryOutputs: draft.inventoryOutputs ?? undefined,
    };

      // include statusId when provided by the modal draft so backend receives updated status
      try {
        if (draft.statusId)
          toCreate.statusId = draft.statusId;
      } catch (err) {
        // no-op
      }

    try {
      loadingService.show();
      const parentHandlesRefresh = Boolean(propOnCreate || props.onUpdate);
      // if editing an existing draft, delegate to page-level update handler
      if (modalInitialDraft && modalInitialDraft.id) {
        if (props.onUpdate) {
          await props.onUpdate({
            id: modalInitialDraft.id,
            event: toCreate,
            serviceIds: draft.serviceIds,
            employeeIds: draft.employeeIds,
            totalPriceCents: draft.totalPriceCents,
            inventoryInputs: draft.inventoryInputs,
            inventoryOutputs: draft.inventoryOutputs,
            workspaceId: propWorkspaceId ?? null,
          });
        } else {
          // fallback to calling api.updateEvent directly
          if (api.updateEvent) {
            await api.updateEvent({
              id: modalInitialDraft.id,
              event: toCreate,
              serviceIds: draft.serviceIds,
              employeeIds: draft.employeeIds,
              totalPriceCents: draft.totalPriceCents,
              inventoryInputs: draft.inventoryInputs,
              inventoryOutputs: draft.inventoryOutputs,
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
            inventoryInputs: draft.inventoryInputs,
            inventoryOutputs: draft.inventoryOutputs,
            workspaceId: propWorkspaceId ?? null,
          });
        }
      }

      // refresh month events only when parent isn't already handling data refresh
      if (!parentHandlesRefresh) {
        const inst = instanceRef.current;
        const current = inst?.getDate?.();
        const from = dayjs(current).startOf("month").format("YYYY-MM-DD");
        const to = dayjs(current).endOf("month").format("YYYY-MM-DD");
        if (propOnRangeChange) {
          await propOnRangeChange(from, to, {
            viewMode: viewMode === "week" || viewMode === "day" ? viewMode : "month",
            includeViewHint: viewMode === "month",
          });
        } else {
          const range = await api.getEventsWithHint({
            from,
            to,
            workspaceId: propWorkspaceId ?? null,
            calendarView:
              viewMode === "week" || viewMode === "day" ? viewMode : "month",
            includeViewHint: viewMode === "month",
            monthCellVisibleLimit: 2,
            monthViewTimeZone: "America/Sao_Paulo",
          });
          setEvents(range.events ?? []);
          setLocalMonthViewHint(range.monthViewHint ?? null);
        }
      }

      message.success(
        modalInitialDraft && modalInitialDraft.id
          ? appI18n.t("legacyInline.schedule.presentation_components_schedule_calendar_schedule_calendar_component.k005")
          : appI18n.t("legacyInline.schedule.presentation_components_schedule_calendar_schedule_calendar_component.k006")
      );
      setIsModalOpen(false);
      setModalInitialDraft(undefined);
    } catch (err) {
      // create/update schedule failed
      message.error(appI18n.t("legacyInline.schedule.presentation_components_schedule_calendar_schedule_calendar_component.k007"));
    } finally {
      loadingService.hide();
    }
  };

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
                placeholder={appI18n.t("legacyInline.schedule.presentation_components_schedule_calendar_schedule_calendar_component.k008")}
                prefix={<Search size={16} />}
                style={{ width: isMobileViewport ? "100%" : 220 }}
              />
            </div>
          </div>

          {shouldShowMonthHint && activeMonthViewHint ? (
            <MonthHintBanner>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}
              >
                <Typography.Text strong>
                  {activeMonthViewHint.title || appI18n.t("legacyInline.schedule.presentation_components_schedule_calendar_schedule_calendar_component.k009")}
                </Typography.Text>
                <Typography.Text type="secondary">
                  {activeMonthViewHint.message ||
                    appI18n.t("legacyInline.schedule.presentation_components_schedule_calendar_schedule_calendar_component.k010")}
                </Typography.Text>
                <Typography.Text
                  type="secondary"
                  style={{ fontSize: 12 }}
                >{`+${activeMonthViewHint.totalHiddenEvents} ${appI18n.t("legacyInline.schedule.presentation_components_schedule_calendar_schedule_calendar_component.k011")} ${activeMonthViewHint.overloadedDays} ${appI18n.t("legacyInline.schedule.presentation_components_schedule_calendar_schedule_calendar_component.k012")}`}</Typography.Text>
              </div>
              <MonthHintActions>
                <Button size="small" type="primary" onClick={() => setViewMode("week")}>
                  {appI18n.t("legacyInline.schedule.presentation_components_schedule_calendar_schedule_calendar_component.k013")}
                </Button>
                <Button size="small" onClick={() => setViewMode("day")}>
                  {appI18n.t("legacyInline.schedule.presentation_components_schedule_calendar_schedule_calendar_component.k014")}
                </Button>
                <Button
                  size="small"
                  type="text"
                  onClick={() => setDismissedHintMonthKey(currentMonthKey)}
                >
                  {appI18n.t("legacyInline.schedule.presentation_components_schedule_calendar_schedule_calendar_component.k015")}
                </Button>
              </MonthHintActions>
            </MonthHintBanner>
          ) : null}

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
              <Button onClick={handleToday}>{appI18n.t("legacyInline.schedule.presentation_components_schedule_calendar_schedule_calendar_component.k016")}</Button>
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
                  border: shouldShowMonthHint
                    ? "1px solid color-mix(in srgb, var(--color-primary) 45%, var(--color-border))"
                    : "1px solid transparent",
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
                    { label: appI18n.t("legacyInline.schedule.presentation_components_schedule_calendar_schedule_calendar_component.k017"), value: "month" },
                    { label: appI18n.t("legacyInline.schedule.presentation_components_schedule_calendar_schedule_calendar_component.k018"), value: "week" },
                    { label: appI18n.t("legacyInline.schedule.presentation_components_schedule_calendar_schedule_calendar_component.k019"), value: "day" },
                  ]}
                  style={{ width: isMobileViewport ? "100%" : "auto" }}
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
        availableInventoryItems={propAvailableInventoryItems}
        initialDate={modalInitialDate}
        initialStartTime={modalInitialStartTime}
        initialDraft={modalInitialDraft}
        availableServices={propAvailableServices}
        availableEmployees={propAvailableEmployees}
        settings={propSettings}
        statuses={
          props.statuses
            ? props.statuses.map((s) => ({
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

