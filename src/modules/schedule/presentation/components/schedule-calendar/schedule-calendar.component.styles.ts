import styled, { createGlobalStyle } from "styled-components";

export const CalendarShell = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  height: 100%;
  min-height: 0;
`;

export const ToolbarRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const ToolbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
`;

export const ToolbarRight = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-2);
  flex-wrap: wrap;

  .ant-segmented {
    height: 36px;
    padding: 2px;
    border-radius: var(--radius-sm);
  }

  .ant-segmented-item-label {
    height: 32px;
    line-height: 32px;
    padding-inline: 12px;
  }

  .ant-input-affix-wrapper {
    height: 36px;
    border-radius: var(--radius-sm);
  }

  .ant-btn {
    height: 36px;
    border-radius: var(--radius-sm);
  }

  .ant-btn-icon-only {
    width: 36px;
  }
`;

export const CalendarWrap = styled.div`
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: visible; /* allow absolute popups to escape the rounded container */
  position: relative; /* anchor absolute popup positioning inside this container */
  background: var(--color-surface);

  flex: 1;
  min-height: 0;
  min-width: 0;

  display: flex;
  flex-direction: column;
`;

export const CalendarHost = styled.div`
  width: 100%;
  flex: 1;
  min-height: 0;
  min-width: 0;

  --toastui-calendar-surface: var(--color-surface);
  --toastui-calendar-surface-2: var(--color-surface-2);
  --toastui-calendar-text: var(--color-text);
  --toastui-calendar-text-muted: var(--color-text-muted);
  --toastui-calendar-border: var(--color-border);
  --toastui-calendar-divider: var(--color-divider);
  --toastui-calendar-primary: var(--color-primary);
  --toastui-calendar-on-primary: var(--on-primary);
  --toastui-calendar-glass: var(--color-glass-surface);

  .toastui-calendar-container,
  .toastui-calendar-layout,
  .tui-calendar-container,
  .tui-calendar-layout {
    background: var(--toastui-calendar-surface);
    color: var(--toastui-calendar-text);
  }

  .toastui-calendar-month,
  .toastui-calendar-month-view,
  .toastui-calendar-weekday-grid,
  .toastui-calendar-weekday-grid-header,
  .toastui-calendar-weekday-grid-body {
    background: var(--toastui-calendar-surface);
  }

  .toastui-calendar-weekday-grid-header * {
    color: var(--toastui-calendar-text-muted);
  }

  .toastui-calendar-weekday-grid-line,
  .toastui-calendar-weekday-grid-header,
  .toastui-calendar-weekday-grid-header-line,
  .toastui-calendar-weekday-grid-cell,
  .toastui-calendar-weekday-grid-cell-line,
  .toastui-calendar-weekday-grid-footer,
  .toastui-calendar-weekday-grid-footer-line,
  .toastui-calendar-grid-cell,
  .toastui-calendar-grid-cell-border {
    border-color: var(--toastui-calendar-divider);
  }

  .toastui-calendar-weekday-grid-date {
    color: var(--toastui-calendar-text);
  }

  .toastui-calendar-weekday-grid-date--sunday,
  .toastui-calendar-weekday-grid-date--saturday {
    color: var(--toastui-calendar-text-muted);
  }

  .toastui-calendar-weekday-grid-date--today {
    background: var(--toastui-calendar-primary);
    color: var(--toastui-calendar-on-primary);
    border-radius: 999px;
    width: 28px;
    height: 28px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
  }

  .toastui-calendar-grid-selection,
  .toastui-calendar-selection {
    background: var(--toastui-calendar-glass);
    border-color: var(--toastui-calendar-primary);
  }

  .toastui-calendar-detail-popup,
  .toastui-calendar-popup-container,
  .toastui-calendar-popup {
    background: var(--toastui-calendar-surface);
    color: var(--toastui-calendar-text);
    border-color: var(--toastui-calendar-border);
    box-shadow: var(--shadow-md);
  }

  .toastui-calendar-popup-header,
  .toastui-calendar-popup-section {
    border-color: var(--toastui-calendar-divider);
  }

  .toastui-calendar-popup-close {
    color: var(--toastui-calendar-text-muted);
  }

  /* Strongly-scoped rules to improve event and popup contrast inside this CalendarHost */
  .tui-calendar-month {
    .tui-month-schedule {
      color: var(--toastui-calendar-text);

      &-title,
      .tui-month-schedule-title,
      .tui-calendar-event-title,
      .toastui-calendar-event-title {
        color: var(--toastui-calendar-text) !important;
        font-weight: 700 !important;
        font-size: 12px !important;
        text-shadow: none !important;
      }

      &-dot,
      .tui-month-schedule-dot,
      .tui-calendar-event-dot,
      .toastui-calendar-event-dot {
        /* background intentionally omitted so per-event inline styles control color */
        width: 8px !important;
        height: 8px !important;
        border-radius: 999px !important;
        box-shadow: 0 0 0 3px rgba(0,0,0,0.06) !important;
      }
    }
  }

  /* Popup / detail box */
  .tui-popup,
  .toastui-popup,
  .tui-calendar-popup,
  .toastui-calendar-popup,
  .toastui-calendar-detail-popup,
  .tui-calendar-detail-popup {
    /* allow inline/background from templates to control popup bg; keep other styles */
    color: var(--toastui-calendar-text) !important;
    border: 1px solid var(--toastui-calendar-border) !important;
    box-shadow: var(--shadow-md) !important;
  }

  .tui-calendar-detail-popup .tui-calendar-popup-section,
  .toastui-calendar-detail-popup .toastui-calendar-popup-section {
    border-color: var(--toastui-calendar-divider) !important;
  }
`;

/* Global styles for toast-ui elements that may be rendered outside the host (portals) */
export const ToastUIGlobalStyles = createGlobalStyle`
  /* Use global theme tokens so portal popups inherit app theme */
  .tui-popup,
  .toastui-popup,
  .tui-calendar-popup,
  .toastui-calendar-popup,
  .toastui-calendar-detail-popup,
  .tui-calendar-detail-popup,
  .tui-full-calendar-popup-container,
  .tui-full-calendar-popup {
     /* style the outer popup container to match app theme */
     background: var(--color-surface) !important;
     color: var(--color-text) !important;
     border: 1px solid var(--color-border) !important;
     box-shadow: var(--shadow-md) !important;
     border-radius: 8px !important;
     z-index: 10000 !important;
  }

  .tui-full-calendar-popup-container,
  .tui-popup,
  .toastui-popup,
  .tui-calendar-popup,
  .toastui-calendar-popup,
  .toastui-calendar-detail-popup,
  .tui-calendar-detail-popup {
    background: transparent !important;
    color: var(--color-text) !important;
    border: 0 transparent !important;
    box-shadow: none !important;
  }

  .tui-popup .tui-popup-content,
  .toastui-popup .toastui-popup-content,
  .tui-calendar-detail-popup .tui-calendar-popup-section,
  .toastui-calendar-detail-popup .toastui-calendar-popup-section,
  .tui-full-calendar-popup-section {
     /* keep inner container transparent so our custom inner popup renders cleanly */
     background: transparent !important;
     padding: 12px !important;
     border-color: var(--color-divider) !important;
  }

  .tui-month-schedule-title,
  .tui-calendar-event-title,
  .toastui-calendar-event-title,
  .tui-custom-title,
  .tui-custom-popup-title {
    color: var(--color-text) !important;
    font-weight: 700 !important;
    font-size: 12px !important;
    text-shadow: none !important;
  }

  .tui-month-schedule-dot,
  .tui-calendar-event-dot,
  .toastui-calendar-event-dot,
  .tui-custom-dot {
    background: var(--color-primary);
    width: 8px !important;
    height: 8px !important;
    border-radius: 999px !important;
    box-shadow: 0 0 0 3px rgba(0,0,0,0.06) !important;
  }

  /* style our custom popup content injected by template.popupDetail */
  .tui-custom-popup {
    background: var(--color-surface);
    color: var(--color-text) !important;
    border: 1px solid var(--color-border) !important;
    box-shadow: var(--shadow-md) !important;
    border-radius: 8px;
    padding: 12px !important;
  }
  .tui-custom-popup .tui-custom-popup-time {
    color: var(--color-text-muted) !important;
  }

  .tui-popup,
  .toastui-popup,
  .tui-calendar-detail-popup,
  .toastui-calendar-detail-popup,
  .tui-full-calendar-popup-container,
  .tui-full-calendar-popup {
    background: transparent !important;
    color: var(--color-text) !important;
    border: 0 !important;
    box-shadow: none !important;
  }

  .tui-popup .tui-popup-content,
  .toastui-popup .toastui-popup-content,
  .tui-calendar-detail-popup .tui-calendar-popup-section,
  .toastui-calendar-detail-popup .toastui-calendar-popup-section,
  .tui-full-calendar-popup-section {
    background: transparent !important;
    padding: 0 !important;
    margin: 0 !important;
    border: none !important;
    box-shadow: none !important;
  }

  /* Hide default popup content container; allow our custom popup (if present) to display */
  .tui-popup .tui-popup-content,
  .toastui-popup .toastui-popup-content {
    /* Hide default inner children but allow our custom popup to show */
    .tui-popup .tui-popup-content > *,
    .toastui-popup .toastui-popup-content > * {
      display: none !important;
    }

    .tui-popup .tui-popup-content .tui-custom-popup,
    .toastui-popup .toastui-popup-content .tui-custom-popup {
      display: block !important;
      position: relative !important;
      z-index: 2147483647 !important;
      pointer-events: auto !important;
  }

  /* If our custom popup exists inside the popup content, force it visible */
  .tui-popup .tui-popup-content .tui-custom-popup,
  .toastui-popup .toastui-popup-content .tui-custom-popup {
    display: block !important;
    position: relative !important;
    z-index: 2147483647 !important;
    pointer-events: auto !important;
  }

  /* Styles for React-managed popup (absolute inside CalendarWrap) */
  .tui-react-popup {
    pointer-events: auto;
  }

  .tui-react-popup .tui-custom-popup {
    /* fixed popup width requested by user */
    width: 250px !important;
    min-width: 250px !important;
    position: relative;
    padding: 16px !important;
    overflow: hidden; /* prevent content from resizing the card */
  }

  .tui-custom-popup-header {
    margin-bottom: 6px;
  }

  .tui-custom-popup-title {
    font-weight: 800;
    font-size: 14px;
    color: var(--color-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tui-custom-popup-status {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    color: var(--color-text);
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(0,0,0,0.06);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .tui-custom-popup-time {
    font-size: 12px;
    color: var(--color-text-muted);
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .tui-custom-popup-body {
    font-size: 13px;
    color: var(--color-text);
    margin-bottom: 12px;
    line-height: 1.2;
    /* clamp to 3 lines with ellipsis */
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .tui-custom-popup-meta {
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: var(--color-text-muted);
    margin-bottom: 8px;
  }

  .tui-custom-popup-meta .meta-item {
    display:flex;align-items:center;gap:6px;
  }
  .tui-custom-popup-footer {
    display:flex;
    gap:8px;
    justify-content:flex-end;
    margin-top:6px;
  }

  .tui-custom-popup-edit {
    /* lightweight Ant-like primary appearance for template-rendered button */
    background: var(--color-primary) !important;
    color: var(--on-primary) !important;
    border-radius: 20px !important;
    padding: 6px 12px !important;
    font-weight: 600 !important;
  }

  .tui-custom-popup-delete {
    background: transparent !important;
    color: var(--color-text-muted) !important;
    border: 1px solid var(--color-border) !important;
    padding: 6px 12px !important;
    border-radius: 8px !important;
  }

  /* if the title or body are too long, ensure the whole card keeps fixed height */
  .tui-custom-popup * { box-sizing: border-box; }

  /* Ensure ANY custom popup rendered by toast-ui or React keeps fixed dimensions */
  .tui-custom-popup {
    width: 250px !important;
    min-width: 250px !important;
    overflow: hidden !important;
  }

  .tui-custom-popup .tui-custom-popup-title {
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }

  .tui-custom-popup .tui-custom-popup-body {
    display: -webkit-box !important;
    -webkit-line-clamp: 3 !important;
    -webkit-box-orient: vertical !important;
    overflow: hidden !important;
  }
`;
