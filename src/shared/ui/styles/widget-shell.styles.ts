import styled from "styled-components";

export const WidgetCardBase = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  height: 100%;
`;

export const WidgetHeaderBase = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  min-width: 0;
`;

export const WidgetBodyBase = styled.div`
  flex: 1;
  min-height: 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

export const ChartWrapBase = styled.div`
  width: 100%;
  height: 100%;
  min-height: 0;
  min-width: 0;

  .recharts-responsive-container {
    width: 100% !important;
    height: 100% !important;
    min-width: 0 !important;
    min-height: 0 !important;
  }
`;

export const TooltipCardBase = styled.div`
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  box-shadow: var(--shadow-md);
`;
