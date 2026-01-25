import styled from "styled-components";

export const EmptyState = styled.div`
  padding: var(--space-7);
  border-radius: var(--radius-lg);
  border: 1px dashed var(--color-divider);
  text-align: center;
  background: var(--color-surface);
`;

export const EmptyTitle = styled.h3`
  margin: 0 0 var(--space-2);
`;

export const EmptyText = styled.p`
  margin: 0;
  color: var(--color-text-muted);
`;
