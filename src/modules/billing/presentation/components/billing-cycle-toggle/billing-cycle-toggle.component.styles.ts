import styled from "styled-components";

export const ToggleContainer = styled.div<{ $fullWidth?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: color-mix(in srgb, var(--color-surface-2) 72%, transparent);
  width: ${({ $fullWidth }) => ($fullWidth ? "100%" : "auto")};
`;

export const ToggleButton = styled.button<{ $active: boolean; $compact?: boolean }>`
  appearance: none;
  border: 0;
  border-radius: 999px;
  background: ${({ $active }) =>
    $active
      ? "color-mix(in srgb, var(--color-primary) 42%, transparent)"
      : "transparent"};
  color: ${({ $active }) =>
    $active ? "var(--color-text)" : "var(--color-text-muted)"};
  cursor: pointer;
  font-weight: 600;
  font-size: ${({ $compact }) =>
    $compact ? "var(--font-size-sm)" : "var(--font-size-md)"};
  padding: ${({ $compact }) => ($compact ? "4px 12px" : "6px 14px")};
  min-width: 96px;
  transition: background-color 120ms ease, color 120ms ease;

  &:hover {
    color: var(--color-text);
  }
`;
