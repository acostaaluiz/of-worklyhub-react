import styled from "styled-components";
import { BaseTemplate } from "@shared/base/base.template";

export const FinanceTemplateShell = styled(BaseTemplate)`
  height: 100%;
  min-height: 0;
`;

export const PageStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);

  /* CRITICAL: fill the private-frame height without overflowing */
  height: 100%;
  min-height: 0;

  @media (max-width: 1024px) {
    height: auto;
  }
`;

export const TemplateTitleRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-4);
`;

export const TemplateTitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-1);

  h2,
  h3 {
    font-weight: 900;
    letter-spacing: -0.01em;
  }
`;

export const FiltersCard = styled.div`
  padding: var(--space-4);
  min-width: 0;
`;

export const DashboardShell = styled.div`
  /* CRITICAL: makes the grid fill remaining space */
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  gap: var(--space-4);
`;

export const DashboardGrid = styled.div`
  /* CRITICAL: 12-col grid + minmax(0,1fr) */
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

const spanBase = `
  min-width: 0;
  min-height: 0;

  .surface {
    height: 100%;
    min-height: 0;
    min-width: 0;
  }
`;

export const GridSpan12 = styled.div`
  grid-column: span 12;
  ${spanBase}
`;

export const GridSpan8 = styled.div`
  grid-column: span 8;
  ${spanBase}

  @media (max-width: 1024px) {
    grid-column: span 12;
  }
`;

export const GridSpan6 = styled.div`
  grid-column: span 6;
  ${spanBase}

  @media (max-width: 1024px) {
    grid-column: span 12;
  }
`;

export const GridSpan4 = styled.div`
  grid-column: span 4;
  ${spanBase}

  @media (max-width: 1024px) {
    grid-column: span 12;
  }
`;
