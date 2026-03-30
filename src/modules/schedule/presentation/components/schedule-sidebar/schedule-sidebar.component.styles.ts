import styled from "styled-components";

export const SidebarHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);

  @media (max-width: 640px) {
    flex-wrap: wrap;
  }
`;

export const SidebarTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;

  .title {
    font-size: var(--font-size-base);
    font-weight: 700;
    line-height: var(--line-height-tight);
  }

  .subtitle {
    color: var(--color-text-muted);
    font-size: var(--font-size-xs);
  }
`;

export const Block = styled.section`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
`;

export const BlockHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);

  .label {
    font-weight: 700;
    font-size: var(--font-size-sm);
  }
`;

export const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const CategoryListScroll = styled.div`
  max-height: 172px;
  overflow-y: auto;
  padding-right: 4px;
`;

export const CategoryRow = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding: 6px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-glass-surface);

  .left {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: ${(p) => p.$color};
    /* subtle halo like before */
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.04);
  }

  .name {
    font-size: 13px;
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

  @media (max-width: 640px) {
    padding: var(--space-2);
    gap: var(--space-2);
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

export const NextBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: var(--space-2);
`;

export const NextCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 8px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-glass-surface);

  .time {
    font-weight: 700;
    font-size: 13px;
  }

  .title {
    font-size: 13px;
    color: var(--color-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .meta {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
  }
`;
