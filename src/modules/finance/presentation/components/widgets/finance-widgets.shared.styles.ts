import styled from "styled-components";
import {
  ChartWrapBase,
  TooltipCardBase,
  WidgetBodyBase,
  WidgetCardBase,
  WidgetHeaderBase,
} from "@shared/ui/styles/widget-shell.styles";

export const WidgetCard = styled(WidgetCardBase)`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  min-width: 0;
  padding: var(--space-4);
`;

export const WidgetHeader = styled(WidgetHeaderBase)`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: var(--space-3);
  min-width: 0;

  .titleRow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
  }

  .title {
    font-size: 14px;
    font-weight: 900;
    letter-spacing: -0.01em;
  }

  .titleIcon {
    color: var(--color-text-muted);
    display: inline-flex;
    align-items: center;
  }

  .subtitle {
    font-size: 12px;
    color: var(--color-text-muted);
    line-height: 1.25;
  }
`;

export const WidgetBody = styled(WidgetBodyBase)``;

export const ChartWrap = styled(ChartWrapBase)``;

export const TooltipCard = styled(TooltipCardBase)`
  background: var(--color-surface);
  border-radius: var(--radius-3);
  box-shadow: var(--shadow-2);
  min-width: 180px;

  .tTitle {
    font-size: 12px;
    font-weight: 800;
    margin-bottom: var(--space-2);
  }

  .tRow {
    display: flex;
    justify-content: space-between;
    gap: var(--space-3);
    font-size: 12px;

    .k {
      color: var(--color-text-muted);
      white-space: nowrap;
    }
    .v {
      font-weight: 800;
      white-space: nowrap;
    }
  }
`;
