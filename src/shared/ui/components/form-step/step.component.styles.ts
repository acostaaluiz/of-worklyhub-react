import styled from "styled-components";
import type { StepStatus } from "./step.component";

export const StepItem = styled.button<{ $status: StepStatus }>`
  width: 100%;
  border: 0;
  background: transparent;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  cursor: pointer;
  text-align: left;

  border: 1px solid transparent;

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
  }

  ${(p) =>
    p.$status === "active"
      ? `
    background: rgba(255,255,255,0.06);
    border-color: var(--color-border);
  `
      : ""}

  ${(p) =>
    p.$status === "done"
      ? `
    opacity: 0.95;
  `
      : ""}

  ${(p) =>
    p.$status === "pending"
      ? `
    opacity: 0.75;
  `
      : ""}

  .badge {
    width: 28px;
    height: 28px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 12px;
    border: 1px solid var(--color-border);
    color: var(--color-text);
    background: var(--color-glass-surface);
    flex: 0 0 auto;
  }

  ${(p) =>
    p.$status === "active"
      ? `
    .badge {
      background: var(--color-primary);
      color: var(--on-primary);
      border-color: transparent;
    }
  `
      : ""}

  ${(p) =>
    p.$status === "done"
      ? `
    .badge {
      background: var(--color-secondary);
      color: var(--on-secondary);
      border-color: transparent;
    }
  `
      : ""}
`;

export const StepMeta = styled.div`
  display: flex;
  gap: var(--space-3);
  align-items: flex-start;
`;

export const StepTitle = styled.div`
  font-weight: 900;
  color: var(--color-text);
  line-height: 1.2;
`;

export const StepSubtitle = styled.div`
  margin-top: 2px;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  line-height: 1.35;
`;
