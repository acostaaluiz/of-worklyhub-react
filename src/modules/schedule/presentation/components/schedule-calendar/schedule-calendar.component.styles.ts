import styled from "styled-components";

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
  overflow: hidden;
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
`;
