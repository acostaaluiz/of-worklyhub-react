import styled from "styled-components";
import type { StepStatus } from "./step.component";

export const StepItem = styled.button<{ $status: StepStatus }>`
  width: 100%;
  border: 0;
  background: transparent;
  padding: 10px;
  border-radius: var(--radius-md);
  cursor: pointer;
  text-align: left;

  border: 1px solid transparent;

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
  }

  ${(props) =>
    props.$status === "active"
      ? `
    background: color-mix(in srgb, var(--color-primary) 10%, transparent);
    border-color: color-mix(in srgb, var(--color-primary) 24%, var(--color-border));
  `
      : ""}

  ${(props) =>
    props.$status === "done"
      ? `
    opacity: 0.95;
  `
      : ""}

  ${(props) =>
    props.$status === "pending"
      ? `
    opacity: 0.78;
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

  ${(props) =>
    props.$status === "active"
      ? `
    .badge {
      background: var(--color-primary);
      color: var(--on-primary);
      border-color: transparent;
    }
  `
      : ""}

  ${(props) =>
    props.$status === "done"
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
  gap: var(--space-2);
  align-items: flex-start;
`;

export const StepTitleRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;

  .icon {
    width: 16px;
    height: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-muted);
  }
`;

export const StepTitle = styled.div`
  font-weight: 900;
  color: var(--color-text);
  line-height: 1.2;
`;

export const StepSubtitle = styled.div`
  margin-top: 2px;
  font-size: 12px;
  color: var(--color-text-muted);
  line-height: 1.35;
`;
