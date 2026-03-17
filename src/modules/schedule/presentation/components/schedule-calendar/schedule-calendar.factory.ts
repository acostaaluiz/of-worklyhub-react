import dayjs from "dayjs";
import type { EventObject } from "@toast-ui/calendar";
import { i18n as appI18n } from "@core/i18n";

type PopupWorker = {
  email?: string;
  fullName?: string;
  userUid?: string;
};

type PopupStatus = {
  label?: string;
  code?: string;
};

type PopupCategory = {
  label?: string;
};

type PopupRaw = {
  categoryColor?: string;
  statusColor?: string;
  description?: string;
  workers?: PopupWorker[] | null;
  status?: PopupStatus | null;
  category?: PopupCategory | null;
};

type CalendarTemplateModel = EventObject & {
  raw?: PopupRaw;
  body?: string;
  backgroundColor?: string;
  color?: string;
};

type CalendarDefinition = {
  id: string;
  name: string;
  backgroundColor?: string;
  borderColor?: string;
  color?: string;
};

type CalendarTheme = Record<string, DataValue>;

export function escapeHtml(input?: string | null) {
  if (!input) return "";
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const HEX_COLOR_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const CSS_VAR_COLOR_RE = /^var\(--[a-z0-9-]+\)$/i;
const RGB_COLOR_RE =
  /^rgba?\(\s*(\d{1,3})\s*(?:,|\s)\s*(\d{1,3})\s*(?:,|\s)\s*(\d{1,3})(?:\s*(?:,|\/)\s*(0|1|0?\.\d+))?\s*\)$/i;

function toHexByte(value: number): string {
  return Math.max(0, Math.min(255, value))
    .toString(16)
    .padStart(2, "0");
}

function rgbToHex(
  redRaw: string,
  greenRaw: string,
  blueRaw: string
): string | undefined {
  const red = Number.parseInt(redRaw, 10);
  const green = Number.parseInt(greenRaw, 10);
  const blue = Number.parseInt(blueRaw, 10);
  if (
    !Number.isFinite(red) ||
    !Number.isFinite(green) ||
    !Number.isFinite(blue) ||
    red < 0 ||
    red > 255 ||
    green < 0 ||
    green > 255 ||
    blue < 0 ||
    blue > 255
  ) {
    return undefined;
  }
  return `#${toHexByte(red)}${toHexByte(green)}${toHexByte(blue)}`;
}

function normalizeHex(value: string): string {
  if (value.length === 4) {
    const r = value[1];
    const g = value[2];
    const b = value[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return value.toLowerCase();
}

export const normalizeCssColor = (value?: string | null): string | undefined => {
  if (typeof value !== "string") return undefined;
  const v = value.trim();
  if (!v) return undefined;

  if (CSS_VAR_COLOR_RE.test(v)) return v;
  if (HEX_COLOR_RE.test(v)) return normalizeHex(v);

  const rgbMatch = v.match(RGB_COLOR_RE);
  if (rgbMatch) {
    return rgbToHex(rgbMatch[1], rgbMatch[2], rgbMatch[3]);
  }

  if (typeof document === "undefined") return undefined;
  const el = document.createElement("div");
  el.style.color = "";
  el.style.color = v;
  if (!el.style.color) return undefined;
  document.body.appendChild(el);
  const computed = getComputedStyle(el).color || "";
  document.body.removeChild(el);
  const computedMatch = computed.match(RGB_COLOR_RE);
  if (!computedMatch) return undefined;
  return rgbToHex(computedMatch[1], computedMatch[2], computedMatch[3]);
};

export const buildCalendarTemplates = () => ({
  milestoneTitle: () => "",
  taskTitle: () => "",
  alldayTitle: () => "",
  monthMoreClose: () =>
    '<span class="tui-more-close-icon" aria-hidden="true">&times;</span>',
  monthGridEvent: (model: CalendarTemplateModel) => {
    try {
      // monthGridEvent template
      const cardBg =
        normalizeCssColor(model?.raw?.categoryColor) ??
        normalizeCssColor(model?.raw?.statusColor) ??
        normalizeCssColor(model.backgroundColor) ??
        "var(--color-primary)";
      const dotColor =
        normalizeCssColor(model?.raw?.statusColor) ??
        normalizeCssColor(model?.raw?.categoryColor) ??
        normalizeCssColor(model.backgroundColor) ??
        cardBg;
      const fg = normalizeCssColor(model.color) ?? "var(--color-text)";
      return `
        <div class="tui-custom-month-event" style="display:flex;align-items:center;gap:8px;background:${cardBg} !important;padding:6px;border-radius:6px;color:${fg};">
          <span class="tui-custom-dot" style="width:8px;height:8px;border-radius:999px;display:inline-block;background:${dotColor} !important;"></span>
          <span class="tui-custom-title" style="color:${fg};font-weight:700;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(model.title)}</span>
        </div>`;
    } catch (err) {
      return escapeHtml(model.title || "");
    }
  },
  popupDetail: (model: CalendarTemplateModel) => {
    try {
      const fg = normalizeCssColor(model.color) ?? "var(--color-text)";
      const bg =
        normalizeCssColor(model?.raw?.categoryColor) ??
        normalizeCssColor(model?.raw?.statusColor) ??
        normalizeCssColor(model.backgroundColor) ??
        "var(--color-surface)";
      const start = model.start ? dayjs(model.start) : null;
      const end = model.end ? dayjs(model.end) : null;
      const timeRange = start && end ? `${start.format("HH:mm")} - ${end.format("HH:mm")}` : "";
      const body = model.body || (model.raw && model.raw.description) || "";
      const workers = (model.raw && model.raw.workers) || null;
      const workersText = Array.isArray(workers) && workers.length > 0
        ? workers
            .map((w) =>
              escapeHtml((w && (w.email || w.fullName || w.userUid)) || "")
            )
            .join(", ")
        : null;
      const categoryLabel = (model.raw && model.raw.category && model.raw.category.label) || model.calendarId || '';
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
                <div style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${workersText ? workersText : "-"}</div>
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
            <button class="ant-btn ant-btn-default ant-btn-sm tui-custom-popup-delete" title="${appI18n.t("legacyInline.schedule.presentation_components_schedule_calendar_schedule_calendar_factory.k001")}">${appI18n.t("legacyInline.schedule.presentation_components_schedule_calendar_schedule_calendar_factory.k002")}</button>
            <button class="ant-btn ant-btn-primary ant-btn-sm tui-custom-popup-edit" title="${appI18n.t("legacyInline.schedule.presentation_components_schedule_calendar_schedule_calendar_factory.k003")}">${appI18n.t("legacyInline.schedule.presentation_components_schedule_calendar_schedule_calendar_factory.k004")}</button>
          </div>
        </div>`;
    } catch (err) {
      return model.title || "";
    }
  },
});

export const buildCalendarOptions = (opts: {
  viewMode: "month" | "week" | "day";
  tuiCalendars: CalendarDefinition[];
  tuiEvents: EventObject[];
  calendarTheme: CalendarTheme;
}) => ({
  height: "100%",
  defaultView: opts.viewMode,
  calendars: opts.tuiCalendars,
  events: opts.tuiEvents,
  theme: opts.calendarTheme,
  template: buildCalendarTemplates(),
  week: {
    eventView: ["time"],
    taskView: false,
    hourStart: 7,
    hourEnd: 22,
    showNowIndicator: true,
    showTimezoneCollapseButton: false,
    timezonesCollapsed: true,
  },
  month: {
    startDayOfWeek: 0,
    visibleWeeksCount: 0,
    isAlways6Weeks: false,
    visibleEventCount: 2,
  },
  usageStatistics: false,
  useDetailPopup: false,
  useFormPopup: false,
});
