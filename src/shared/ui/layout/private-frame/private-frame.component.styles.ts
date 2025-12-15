import styled from "styled-components";

export const PrivatePageShell = styled.div`
  min-height: 100vh;
  width: 100%;

  display: flex;
  flex-direction: column;
  align-items: stretch;

  padding: 0;
`;

export const ContentShell = styled.main`
  width: 100%;
  padding: var(--space-6) 0 var(--space-8);
  flex: 1;

  @media (max-width: 768px) {
    padding: var(--space-5) 0 var(--space-7);
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

  margin-top: var(--space-2);

  @media (max-width: 768px) {
    padding: var(--space-3);
    margin-top: var(--space-2);
  }
`;
