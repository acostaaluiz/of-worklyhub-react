import styled from "styled-components";

export const TableWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  min-width: 0;

  .ant-table-wrapper {
    min-width: 0;
  }
`;

export const TableMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  color: var(--color-text-muted);
  font-size: 12px;
  flex-wrap: wrap;
`;
