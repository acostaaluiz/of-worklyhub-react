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
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
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

export const HeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
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

  display: flex;
  flex-direction: column;

  .surface {
    /* make the card fill the column so both columns match height */
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  @media (max-width: 1024px) {
    grid-column: span 6 / span 6;
  }

  @media (max-width: 640px) {
    grid-column: span 4 / span 4;
  }
`;

export const AsideColumn = styled.div`
  grid-column: span 5 / span 5;

  display: flex;
  flex-direction: column;

  .surface {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  @media (max-width: 1024px) {
    grid-column: span 6 / span 6;
  }

  @media (max-width: 640px) {
    grid-column: span 4 / span 4;
  }
`;
