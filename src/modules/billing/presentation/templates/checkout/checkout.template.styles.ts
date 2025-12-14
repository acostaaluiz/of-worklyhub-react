import styled from "styled-components";

export const Shell = styled.div`
  padding: var(--space-6);
  border-radius: var(--radius-lg);

  @media (max-width: 768px) {
    padding: var(--space-5);
  }

  @media (max-width: 480px) {
    padding: var(--space-4);
  }
`;

export const HeaderRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-4);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const HeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: var(--space-4);

  @media (max-width: 1024px) {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

export const MainColumn = styled.div`
  grid-column: span 7 / span 7;

  @media (max-width: 1024px) {
    grid-column: span 6 / span 6;
  }

  @media (max-width: 640px) {
    grid-column: span 4 / span 4;
  }
`;

export const AsideColumn = styled.div`
  grid-column: span 5 / span 5;

  @media (max-width: 1024px) {
    grid-column: span 6 / span 6;
  }

  @media (max-width: 640px) {
    grid-column: span 4 / span 4;
  }
`;
