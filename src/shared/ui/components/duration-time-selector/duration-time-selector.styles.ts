import styled from "styled-components";

export const SlotsRail = styled.div`
  display: flex;
  gap: var(--space-2);
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

export const TimeChip = styled.button<{ $active?: boolean }>`
  border: 1px solid var(--color-border);
  background: ${(p) => (p.$active ? "var(--color-tertiary)" : "var(--color-surface)")};
  color: ${(p) => (p.$active ? "var(--on-tertiary)" : "var(--color-text)")};
  border-radius: var(--radius-sm);
  padding: 6px 10px;
  min-width: 64px;
  text-align: center;
  cursor: pointer;

  &:hover {
    border-color: rgba(122, 44, 255, 0.55);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
