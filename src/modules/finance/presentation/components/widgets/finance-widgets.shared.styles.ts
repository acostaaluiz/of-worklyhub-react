import styled from "styled-components";

export const WidgetCard = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  min-width: 0;
  padding: var(--space-4);
`;

export const WidgetHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: var(--space-3);
  min-width: 0;

  .title {
    font-size: 14px;
    font-weight: 900;
    letter-spacing: -0.01em;
  }

  .subtitle {
    font-size: 12px;
    color: var(--color-text-muted);
    line-height: 1.25;
  }
`;

export const WidgetBody = styled.div`
  flex: 1;
  min-height: 0;
  min-width: 0;

  display: flex;
  flex-direction: column;
`;

export const ChartWrap = styled.div`
  width: 100%;
  height: 100%;
  min-height: 0;
  min-width: 0;

  /* make sure recharts respects the chain */
  .recharts-responsive-container {
    width: 100% !important;
    height: 100% !important;
    min-width: 0 !important;
    min-height: 0 !important;
  }
`;

export const TooltipCard = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-3);
  padding: var(--space-3);
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
