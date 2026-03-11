import styled from "styled-components";
import {
  ChartWrapBase,
  TooltipCardBase,
  WidgetBodyBase,
  WidgetCardBase,
  WidgetHeaderBase,
} from "@shared/ui/styles/widget-shell.styles";

export const ChartWrap = styled(ChartWrapBase)``;

export const WidgetCard = styled(WidgetCardBase)`
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  min-width: 0;
  min-height: 0;
  height: 100%;
  border-radius: var(--radius-xl);
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--color-border) 72%, transparent);
  background:
    radial-gradient(circle at 100% 0%, color-mix(in srgb, var(--color-primary) 20%, transparent) 0%, transparent 45%),
    var(--color-surface);
`;

export const WidgetHeader = styled(WidgetHeaderBase)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);

  .title {
    font-weight: 900;
    letter-spacing: -0.01em;
  }

  .subtitle {
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
  }

  .header-icon {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text);
    background: color-mix(in srgb, var(--color-primary) 18%, transparent);
    border: 1px solid color-mix(in srgb, var(--color-primary) 34%, transparent);
  }
`;

export const WidgetBody = styled(WidgetBodyBase)`
  align-items: center;
  justify-content: center;
`;

export const TooltipCard = styled(TooltipCardBase)`
  background: var(--color-surface-elevated);
  box-shadow: var(--shadow-md);
  min-width: 220px;

  .label {
    font-weight: 800;
    margin-bottom: 6px;
  }

  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
  }

  .value {
    color: var(--color-text);
    font-weight: 800;
  }
`;
