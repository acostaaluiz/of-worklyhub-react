import styled from "styled-components";

export const PrivatePageShell = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8) 0;

  @media (max-width: 768px) {
    padding: var(--space-6) 0;
  }
`;

export const PrivateFrame = styled.div`
  width: 100%;
  max-width: 1120px;
  margin-inline: auto;

  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-elevated);

  padding: var(--space-4);
  overflow: hidden;

  @media (max-width: 768px) {
    padding: var(--space-3);
  }
`;
