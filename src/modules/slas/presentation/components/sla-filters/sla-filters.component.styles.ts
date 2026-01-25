import styled from "styled-components";

export const FiltersRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
`;

export const FiltersGroup = styled.div`
  display: flex;
  align-items: flex-end;
  gap: var(--space-3);
  flex-wrap: wrap;
`;

export const FilterField = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 220px;

  .label {
    color: var(--color-text-muted);
    font-size: 12px;
    white-space: nowrap;
  }
`;

export const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;

  @media (max-width: 1024px) {
    width: 100%;
    justify-content: flex-end;
  }
`;
