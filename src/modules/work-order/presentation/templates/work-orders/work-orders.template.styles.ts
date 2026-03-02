import styled from "styled-components";

export const PageStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  min-height: calc(100vh - 220px);
  animation: motion-fade-up var(--motion-duration-enter)
    var(--motion-ease-standard) both;

  @media (max-width: 1024px) {
    min-height: auto;
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
`;

export const TemplateTitleBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

export const TemplateIcon = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid color-mix(in srgb, var(--color-primary) 24%, var(--color-border));
  background: color-mix(in srgb, var(--color-surface-2) 78%, transparent);
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
`;

export const TemplateTitleCopy = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

export const Shell = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 420px;
  gap: var(--space-5);
  align-items: stretch;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
`;

const panelCardStyles = `
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  border-radius: var(--radius-lg);
  border: 1px solid color-mix(in srgb, var(--color-primary) 18%, var(--color-border));
  background:
    linear-gradient(
      140deg,
      color-mix(in srgb, var(--color-surface-2) 72%, transparent),
      var(--color-surface)
    );
  box-shadow: var(--shadow-sm);
  min-height: 0;
  overflow: hidden;
`;

export const ListCard = styled.section`
  ${panelCardStyles}
  height: calc(100vh - 320px);
  min-height: 520px;

  @media (max-width: 1200px) {
    height: auto;
    min-height: 420px;
    overflow-y: visible;
    overflow-x: hidden;
    padding: var(--space-4);
  }

  @media (max-width: 640px) {
    min-height: 360px;
    padding: var(--space-3);
  }
`;

export const EditorCard = styled.section`
  ${panelCardStyles}
  height: calc(100vh - 320px);
  min-height: 520px;

  @media (max-width: 1200px) {
    height: auto;
    min-height: 420px;
    overflow-y: visible;
    overflow-x: hidden;
    padding: var(--space-4);
  }

  @media (max-width: 640px) {
    min-height: 360px;
    padding: var(--space-3);
  }
`;
