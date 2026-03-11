import styled from "styled-components";
import {
  WidgetBodyBase,
  WidgetCardBase,
  WidgetHeaderBase,
} from "@shared/ui/styles/widget-shell.styles";

export const WidgetCard = styled(WidgetCardBase)`
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  background:
    radial-gradient(circle at 100% 0%, color-mix(in srgb, var(--color-warning) 20%, transparent) 0%, transparent 45%),
    var(--color-surface);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const WidgetHeader = styled(WidgetHeaderBase)`
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-divider);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);

  .title {
    font-size: var(--font-size-md);
    font-weight: 800;
    line-height: 1.1;
    color: var(--color-text);
  }

  .subtitle {
    margin-top: 2px;
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
    background: color-mix(in srgb, var(--color-warning) 20%, transparent);
    border: 1px solid color-mix(in srgb, var(--color-warning) 36%, transparent);
  }
`;

export const WidgetBody = styled(WidgetBodyBase)`
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: color-mix(in srgb, var(--color-border) 65%, transparent);
    border-radius: 999px;
  }
`;
