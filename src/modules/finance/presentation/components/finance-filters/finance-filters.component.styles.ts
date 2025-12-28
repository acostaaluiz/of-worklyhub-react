import styled from "styled-components";

export const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  min-width: 0;

  @media (max-width: 1024px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const Left = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
  flex-wrap: wrap;
`;

export const Right = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
  flex-wrap: wrap;

  @media (max-width: 1024px) {
    justify-content: flex-end;
  }
`;

export const PeriodGroup = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;

  .label {
    color: var(--color-text-muted);
    font-size: 12px;
    white-space: nowrap;
  }
`;
