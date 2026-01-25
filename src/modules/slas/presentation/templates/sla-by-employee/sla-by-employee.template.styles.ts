import styled from "styled-components";

export const PageStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  min-height: 0;
`;

export const TemplateTitleRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
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
`;

export const ResultsCard = styled.div`
  padding: var(--space-4);
`;

export const HelperText = styled.p`
  margin: var(--space-2) 0 0;
  color: var(--color-text-muted);
  font-size: 13px;
`;
