import styled from "styled-components";

export const WidgetCard = styled.div`
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);

  .ant-table {
    background: transparent;
  }

  .ant-table-container::before,
  .ant-table-container::after {
    display: none;
  }

  .ant-table-thead > tr > th {
    background: transparent;
    color: var(--color-text-muted);
    border-bottom: 1px solid var(--color-divider);
  }

  .ant-table-tbody > tr > td {
    border-bottom: 1px solid var(--color-divider);
  }
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
