import dayjs from "dayjs";

export function escapeHtml(input?: string | null) {
  if (!input) return "";
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export const normalizeCssColor = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  if (typeof document === 'undefined') return value as string;
  try {
    const v = value.trim();
    if (v.startsWith('#')) return v;
    if (/^rgb/.test(v)) {
      const m = v.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
      if (m) return '#' + [m[1], m[2], m[3]].map(n => parseInt(n, 10).toString(16).padStart(2, '0')).join('');
    }
    const el = document.createElement('div');
    el.style.color = v;
    el.style.display = 'none';
    document.body.appendChild(el);
    const computed = getComputedStyle(el).color || '';
    document.body.removeChild(el);
    const m = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (m) return '#' + [m[1], m[2], m[3]].map(n => parseInt(n, 10).toString(16).padStart(2, '0')).join('');
    return v;
  } catch (err) {
    return value as string;
  }
};

export const buildCalendarTemplates = () => ({
  monthGridEvent: (model: any) => {
    try {
      try { console.debug('tui.monthGridEvent model', model); } catch (err) { console.debug(err); }
      const cardBg = model?.raw?.categoryColor || model?.raw?.statusColor || model.backgroundColor || `var(--color-primary)`;
      const dotColorRaw = model?.raw?.statusColor || model?.raw?.categoryColor || model.backgroundColor || `var(--color-primary)`;
      const dotColor = normalizeCssColor(dotColorRaw) ?? dotColorRaw;
      const fg = model.color || `var(--color-text)`;
      return `
        <div class="tui-custom-month-event" style="display:flex;align-items:center;gap:8px;background:${cardBg} !important;padding:6px;border-radius:6px;color:${fg};">
          <span class="tui-custom-dot" style="width:8px;height:8px;border-radius:999px;display:inline-block;background:${dotColor} !important;"></span>
          <span class="tui-custom-title" style="color:${fg};font-weight:700;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(model.title)}</span>
        </div>`;
    } catch (err) {
      return escapeHtml(model.title || "");
    }
  },
  popupDetail: (model: any) => {
    try {
      const fg = model.color || `var(--color-text)`;
      const bg = model?.raw?.categoryColor || model?.raw?.statusColor || model.backgroundColor || `var(--color-surface)`;
      const start = model.start ? dayjs(model.start) : null;
      const end = model.end ? dayjs(model.end) : null;
      const timeRange = start && end ? `${start.format("HH:mm")} — ${end.format("HH:mm")}` : "";
      const body = model.body || (model.raw && model.raw.description) || "";
      const workers = (model.raw && model.raw.workers) || null;
      const workersText = Array.isArray(workers) && workers.length > 0
        ? workers.map((w: any) => escapeHtml((w && (w.email || w.fullName || w.userUid)) || '')).join(', ')
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
});

export const buildCalendarOptions = (opts: { viewMode: string; tuiCalendars: any[]; tuiEvents: any[]; calendarTheme: any }) => ({
  height: "100%",
  defaultView: opts.viewMode,
  calendars: opts.tuiCalendars,
  events: opts.tuiEvents,
  theme: opts.calendarTheme,
  template: buildCalendarTemplates(),
  month: {
    startDayOfWeek: 0,
    visibleWeeksCount: 0,
    isAlways6Weeks: false,
  },
  usageStatistics: false,
  useDetailPopup: false,
  useFormPopup: false,
} as any);
