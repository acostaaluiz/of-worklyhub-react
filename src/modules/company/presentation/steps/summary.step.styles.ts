import styled from "styled-components";

export const SummaryTabsWrap = styled.div`
  margin-top: var(--space-4);
`;

export const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const SummaryFieldCard = styled.div<{ $full?: boolean }>`
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--color-surface) 94%, transparent);
  padding: 8px 10px;
  min-width: 0;
  ${({ $full }) => ($full ? "grid-column: 1 / -1;" : "")}
`;

export const SummaryFieldLabel = styled.div`
  font-size: 11px;
  color: var(--color-text-muted);
`;

export const SummaryFieldValue = styled.div`
  margin-top: 2px;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.3;
  word-break: break-word;
`;

export const ServiceCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;
