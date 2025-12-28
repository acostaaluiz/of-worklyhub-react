import styled from "styled-components";

export const ChartWrap = styled.div`
  width: 100%;
  height: 100%;
  min-height: 0;
  min-width: 0;

  .recharts-responsive-container {
    width: 100% !important;
    height: 100% !important;
  }
`;

export const WidgetCard = styled.div`
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  min-width: 0;
  min-height: 0;
  height: 100%;
`;

export const WidgetHeader = styled.div`
  display: flex;
  align-items: baseline;
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
`;

export const WidgetBody = styled.div`
  flex: 1;
  min-height: 0;
  min-width: 0;
`;
