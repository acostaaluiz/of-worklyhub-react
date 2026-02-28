import styled from "styled-components";

export const FallbackShell = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8) 0;
`;

export const FallbackCard = styled.div`
  width: 100%;
  max-width: 720px;
  padding: var(--space-7);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  box-shadow: var(--shadow-md);
`;

export const FallbackActions = styled.div`
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
  margin-top: var(--space-5);
`;
