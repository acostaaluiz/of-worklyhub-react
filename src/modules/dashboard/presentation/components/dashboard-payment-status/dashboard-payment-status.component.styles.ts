import styled from "styled-components";

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
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
`;

export const StatusLegend = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-2);

  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
  }

  .left {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    min-width: 0;
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    flex: 0 0 auto;
  }

  .value {
    color: var(--color-text);
    font-weight: 800;
  }
`;
