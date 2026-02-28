import styled from "styled-components";

export const LegalHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
`;

export const LegalMeta = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
`;

export const LegalBody = styled.div`
  margin-top: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
`;

export const LegalSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
`;

export const LegalActions = styled.div`
  margin-top: var(--space-6);
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
`;
