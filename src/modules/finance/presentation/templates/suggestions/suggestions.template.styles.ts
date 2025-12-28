import styled from "styled-components";

export const Shell = styled.div`
  border-radius: 12px;
  padding: 28px;
  background: var(--surface, rgba(255,255,255,0.02));
`;

export const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
`;

export const HeaderText = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 24px;
  align-items: start;
`;

export const MainColumn = styled.div`
  grid-column: span 7 / span 7;

  @media (max-width: 768px) {
    grid-column: span 6 / span 6;
  }

  @media (max-width: 480px) {
    grid-column: span 4 / span 4;
  }
`;

export const AsideColumn = styled.div`
  grid-column: span 5 / span 5;

  @media (max-width: 768px) {
    grid-column: span 6 / span 6;
  }

  @media (max-width: 480px) {
    grid-column: span 4 / span 4;
  }
`;
