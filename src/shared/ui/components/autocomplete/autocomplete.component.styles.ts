import styled from "styled-components";

export const OptionRow = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-1);

  & + & {
    border-top: 1px solid var(--color-border);
  }
`;

export const OptionIcon = styled.span`
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: var(--color-glass-surface);
  border: 1px solid var(--color-border);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  flex-shrink: 0;
`;

export const OptionTexts = styled.span`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  overflow: hidden;
`;

export const OptionTitle = styled.span`
  font-weight: 700;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: var(--line-height-tight);
`;

export const OptionSubtitle = styled.span`
  color: var(--color-text-muted);
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: var(--line-height-tight);
`;

export const EmptyState = styled.div`
  padding: var(--space-2) var(--space-3);
  color: var(--color-text-muted);
  font-size: 13px;
`;
