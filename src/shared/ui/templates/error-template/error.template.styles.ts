import styled from "styled-components";

export const TemplateShell = styled.div`
  width: 100%;
  max-width: 920px;
  margin-inline: auto;
  padding: var(--space-7);

  @media (max-width: 768px) {
    padding: var(--space-6);
  }
`;

export const TemplateCard = styled.div`
  width: 100%;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-md);
  background: var(--color-surface);
  padding: var(--space-7);

  @media (max-width: 480px) {
    padding: var(--space-6);
  }
`;

export const Actions = styled.div`
  margin-top: var(--space-6);
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
  flex-wrap: wrap;
`;

export const Details = styled.div`
  margin-top: var(--space-6);
  border: 1px solid var(--color-border);
  background: var(--color-glass-surface);
  border-radius: var(--radius-md);
  padding: var(--space-3);

  display: flex;
  flex-direction: column;
  gap: var(--space-2);

  font-size: var(--font-size-sm);
  color: var(--color-text-muted);

  code {
    font-family: var(--font-family-mono);
    color: var(--color-text);
    word-break: break-word;
  }
`;
