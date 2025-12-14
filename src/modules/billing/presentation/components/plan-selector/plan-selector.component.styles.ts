import styled from "styled-components";

export const HeaderRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-6);
  margin-bottom: var(--space-6);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const ToggleWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-2);

  @media (max-width: 768px) {
    align-items: flex-start;
  }

  /* Fix visual do Segmented (Antd) para não “vazar” e manter o highlight correto */
  .ant-segmented {
    border: 1px solid var(--color-border);
    background: var(--color-glass-surface);
    border-radius: 999px;
    padding: 4px;
  }

  .ant-segmented-group {
    gap: 4px;
  }

  .ant-segmented-item {
    border-radius: 999px;
    color: var(--color-text-muted);
    transition: color 120ms ease;
  }

  .ant-segmented-item:hover {
    color: var(--color-text);
  }

  .ant-segmented-thumb {
    background: var(--color-surface);
    border-radius: 999px;
    box-shadow: var(--shadow-sm);
  }

  .ant-segmented-item-selected {
    color: var(--color-text);
  }
`;

export const PlanMeta = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
`;

export const PlanGrid = styled.div`
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

export const PlanCard = styled.div<{ $highlight: boolean }>`
  grid-column: span 4 / span 4;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 420px;
  position: relative;
  overflow: hidden;

  ${({ $highlight }) =>
    $highlight
      ? `
        border-color: color-mix(in srgb, var(--color-primary) 35%, var(--color-border));
        box-shadow: var(--shadow-md);
      `
      : ""}

  @media (max-width: 1024px) {
    grid-column: span 6 / span 6;
  }

  @media (max-width: 640px) {
    grid-column: span 4 / span 4;
  }
`;

export const RecommendedBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: var(--color-glass-surface);
  color: var(--color-text);
  width: fit-content;
  margin-bottom: var(--space-4);
  font-size: var(--font-size-sm);
`;

export const CardTop = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
`;

export const PriceRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  margin-top: var(--space-2);
`;

export const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: var(--space-4) 0 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
`;

export const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-muted);

  svg {
    color: var(--color-primary);
  }
`;

export const CardFooter = styled.div`
  margin-top: var(--space-6);
`;
