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

export const HeadRow = styled.div`
  display: grid;
  grid-template-columns: 44px 1fr;
  align-items: flex-start;
  gap: var(--space-3);
`;

export const IconWrap = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: var(--color-glass-surface);

  display: inline-flex;
  align-items: center;
  justify-content: center;

  svg {
    color: var(--color-secondary);
  }
`;

export const TextBlock = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
`;

export const Actions = styled.div`
  margin-top: var(--space-6);
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
  flex-wrap: wrap;

  .ant-btn {
    height: 44px;
    border-radius: var(--radius-sm);
    padding-inline: 16px;
  }
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
