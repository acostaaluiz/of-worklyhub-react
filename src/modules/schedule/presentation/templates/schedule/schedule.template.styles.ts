import styled from "styled-components";

export const PageStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  min-height: calc(100vh - 220px);

  @media (max-width: 1024px) {
    min-height: auto;
  }
`;

export const Shell = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: var(--space-6);
  align-items: stretch;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
`;

export const SidebarCard = styled.aside`
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);

  max-height: calc(100vh - 320px);
  overflow: auto;

  @media (max-width: 1024px) {
    max-height: none;
    overflow: visible;
    padding: var(--space-4);
  }

  @media (max-width: 640px) {
    padding: var(--space-3);
  }
`;

export const ContentCard = styled.main`
  padding: var(--space-5);

  display: flex;
  flex-direction: column;

  height: calc(100vh - 320px);
  min-height: 560px;

  min-width: 0;
  /* allow popups to escape the content card and not be clipped */
  overflow: visible;

  & > :first-child {
    flex: 1;
    min-height: 0;
  }

  @media (max-width: 1024px) {
    height: auto;
    min-height: 420px;
    overflow: visible;
    padding: var(--space-4);

    & > :first-child {
      min-height: auto;
    }
  }

  @media (max-width: 640px) {
    min-height: 360px;
    padding: var(--space-3);
  }
`;

export const TemplateTitleRow = styled.div`
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
  border-radius: var(--radius-lg);
  border: 1px solid color-mix(in srgb, var(--color-primary) 24%, var(--color-border));
  padding: 14px 16px;
  background:
    radial-gradient(circle at 14% 18%, rgba(30, 112, 255, 0.14), transparent 38%),
    radial-gradient(circle at 86% 86%, rgba(0, 214, 160, 0.12), transparent 42%),
    linear-gradient(
      140deg,
      color-mix(in srgb, var(--color-surface-2) 80%, transparent),
      var(--color-surface)
    );
  box-shadow: var(--shadow-sm);

  @media (max-width: 768px) {
    align-items: flex-start;
  }
`;

export const TemplateTitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: var(--color-divider);
  margin: var(--space-2) 0;
`;
