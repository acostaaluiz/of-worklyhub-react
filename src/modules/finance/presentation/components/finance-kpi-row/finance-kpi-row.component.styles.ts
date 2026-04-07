import styled from "styled-components";

export const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-4);
  min-width: 0;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const KpiCard = styled.div`
  padding: var(--space-4);
  min-width: 0;
`;

export const KpiTop = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3);
  min-width: 0;
`;

export const KpiLead = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
`;

export const KpiIconBadge = styled.div<{ $kind: string }>`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid color-mix(in srgb, var(--color-primary) 24%, var(--color-border));
  background:
    radial-gradient(circle at 25% 25%, rgba(0, 214, 160, 0.14), transparent 52%),
    color-mix(in srgb, var(--color-surface-2) 84%, transparent);
  color: var(--color-text);

  ${({ $kind }) =>
    $kind === "expenses"
      ? `
    background:
      radial-gradient(circle at 25% 25%, rgba(255, 92, 105, 0.2), transparent 52%),
      color-mix(in srgb, var(--color-surface-2) 84%, transparent);
    color: #ff8f98;
  `
      : ""}
`;

export const KpiValue = styled.div`
  font-size: 28px;
  font-weight: 900;
  letter-spacing: -0.01em;
  min-width: 0;
`;

export const KpiMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;

  .label {
    color: var(--color-text-muted);
    font-size: 12px;
    white-space: nowrap;
  }

  .delta {
    color: var(--color-text-muted);
    font-size: 12px;
    white-space: nowrap;
  }
`;
