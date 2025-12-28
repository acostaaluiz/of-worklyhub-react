import styled from "styled-components";

export const PageStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  height: calc(100vh - 220px);
  min-height: 0;

  @media (max-width: 1024px) {
    height: auto;
    min-height: auto;
  }
`;

export const TemplateTitleRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-4);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const TemplateTitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0;
`;

export const DashboardShell = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
`;

export const DashboardGrid = styled.div`
  flex: 1;
  min-height: 0;
  min-width: 0;

  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  grid-auto-rows: minmax(0, 1fr);
  gap: var(--space-4);

  @media (max-width: 1024px) {
    grid-auto-rows: auto;
  }
`;

export const GridSpan12 = styled.div`
  grid-column: span 12 / span 12;
  min-width: 0;
  min-height: 0;

  & > .surface {
    height: 100%;
    min-height: 0;
  }
`;

export const GridSpan8 = styled.div`
  grid-column: span 8 / span 8;
  min-width: 0;
  min-height: 0;

  & > .surface {
    height: 100%;
    min-height: 0;
  }

  @media (max-width: 1024px) {
    grid-column: span 12 / span 12;
  }
`;

export const GridSpan6 = styled.div`
  grid-column: span 6 / span 6;
  min-width: 0;
  min-height: 0;

  & > .surface {
    height: 100%;
    min-height: 0;
  }

  @media (max-width: 1024px) {
    grid-column: span 12 / span 12;
  }
`;

export const GridSpan4 = styled.div`
  grid-column: span 4 / span 4;
  min-width: 0;
  min-height: 0;

  & > .surface {
    height: 100%;
    min-height: 0;
  }

  @media (max-width: 1024px) {
    grid-column: span 12 / span 12;
  }
`;
