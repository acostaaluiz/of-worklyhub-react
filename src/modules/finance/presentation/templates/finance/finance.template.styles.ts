import styled from "styled-components";
import { BaseTemplate } from "@shared/base/base.template";

export const FinanceTemplateShell = styled(BaseTemplate)`
  height: 100%;
  max-height: 100%;
  min-height: 0;
  min-width: 0;
  overflow: hidden;

  > div {
    min-height: 0;
  }

  > div:last-child {
    height: 100%;
    min-height: 0;
  }

  > div:last-child > div:last-child {
    display: flex;
    flex-direction: column;
    min-height: 0;
    min-width: 0;
  }
`;

export const PageStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);

  /* CRITICAL: fill the private-frame height without overflowing */
  height: 100%;
  min-height: 0;
  min-width: 0;
  overflow: hidden;

  @media (max-width: 1024px) {
    height: auto;
    overflow: visible;
  }
`;

export const TemplateTitleRow = styled.div`
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
  border-radius: var(--radius-lg);
  border: 1px solid color-mix(in srgb, var(--color-primary) 24%, var(--color-border));
  padding: 14px 16px;
  background:
    radial-gradient(circle at 14% 18%, rgba(30, 112, 255, 0.14), transparent 38%),
    radial-gradient(circle at 86% 86%, rgba(0, 214, 160, 0.12), transparent 42%),
    linear-gradient(
      140deg,
      color-mix(in srgb, var(--color-surface-2) 80%, transparent),
      var(--color-surface)
    );
  box-shadow: var(--shadow-sm);
`;

export const TemplateTitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  h2,
  h3 {
    font-weight: 900;
    letter-spacing: -0.01em;
  }
`;

export const FiltersCard = styled.div`
  padding: var(--space-4);
  min-width: 0;
  overflow: hidden;
  border-radius: var(--radius-lg);
  border: 1px solid color-mix(in srgb, var(--color-primary) 18%, var(--color-border));
  background:
    linear-gradient(
      140deg,
      color-mix(in srgb, var(--color-surface-2) 72%, transparent),
      var(--color-surface)
    );
  box-shadow: var(--shadow-sm);
`;

export const DashboardShell = styled.div`
  /* CRITICAL: makes the grid fill remaining space */
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  gap: var(--space-4);
`;

export const DashboardGrid = styled.div`
  /* CRITICAL: 12-col grid + minmax(0,1fr) */
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow: hidden;

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
