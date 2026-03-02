import styled from "styled-components";

export const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: var(--space-4);
`;

export const KpiCard = styled.div`
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 0;
  border: 1px solid color-mix(in srgb, var(--color-border) 72%, transparent);
  background:
    radial-gradient(circle at 100% 0%, color-mix(in srgb, var(--color-tertiary) 22%, transparent) 0%, transparent 42%),
    var(--color-surface);
`;

export const KpiTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);

  .label {
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
  }

  .icon {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text);
    background: color-mix(in srgb, var(--color-tertiary) 20%, transparent);
    border: 1px solid color-mix(in srgb, var(--color-tertiary) 35%, transparent);
  }
`;

export const KpiValue = styled.div`
  font-size: 28px;
  font-weight: 900;
  letter-spacing: -0.02em;
`;

export const KpiMeta = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);

  .delta {
    font-weight: 700;
    color: var(--color-link-hover);
  }
`;

export const Span3 = styled.div`
  grid-column: span 3 / span 3;
  min-width: 0;

  @media (max-width: 1024px) {
    grid-column: span 6 / span 6;
  }

  @media (max-width: 640px) {
    grid-column: span 12 / span 12;
  }
`;
