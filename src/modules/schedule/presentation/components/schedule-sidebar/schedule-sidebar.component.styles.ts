import styled from "styled-components";

export const SidebarHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
`;

export const SidebarTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  .title {
    font-size: var(--font-size-lg);
    font-weight: 700;
    line-height: var(--line-height-tight);
  }

  .subtitle {
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
  }
`;

export const Block = styled.section`
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
`;

export const BlockHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);

  .label {
    font-weight: 700;
  }
`;

export const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
`;

export const CategoryRow = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-glass-surface);

  .left {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    min-width: 0;
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: ${(p) => p.$color};
    box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.04);
  }

  .name {
    font-size: var(--font-size-sm);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .count {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
    border: 1px solid var(--color-border);
    padding: 2px 8px;
    border-radius: 999px;
    background: var(--color-surface);
  }
`;

export const MiniCalendarWrap = styled.div`
  .ant-picker-calendar {
    background: transparent;
  }

  .ant-picker-calendar-mini {
    background: transparent;
  }

  .ant-picker-panel {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    overflow: hidden;
    background: var(--color-surface);
  }
`;