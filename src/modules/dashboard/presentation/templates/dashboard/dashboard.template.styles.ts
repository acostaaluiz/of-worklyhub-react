import styled from "styled-components";

export const PageStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  height: calc(100vh - 220px);
  min-height: 0;
  animation: motion-fade-up var(--motion-duration-enter)
    var(--motion-ease-standard) both;

  @media (max-width: 1024px) {
    height: auto;
    min-height: auto;
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

  @media (max-width: 768px) {
    align-items: flex-start;
  }
`;

export const TemplateTitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

export const DashboardShell = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);

  & > * {
    animation: motion-fade-up var(--motion-duration-slow)
      var(--motion-ease-standard) both;
  }

  & > *:nth-child(2) {
    animation-delay: var(--motion-delay-1);
  }

  & > *:nth-child(3) {
    animation-delay: var(--motion-delay-2);
  }

  & > *:nth-child(4) {
    animation-delay: var(--motion-delay-3);
  }
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
