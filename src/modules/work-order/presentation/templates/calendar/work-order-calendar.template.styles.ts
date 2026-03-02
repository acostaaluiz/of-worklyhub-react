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

export const ContentCard = styled.main`
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-lg);
  border: 1px solid color-mix(in srgb, var(--color-primary) 18%, var(--color-border));
  background:
    linear-gradient(
      140deg,
      color-mix(in srgb, var(--color-surface-2) 72%, transparent),
      var(--color-surface)
    );
  box-shadow: var(--shadow-sm);
  height: calc(100vh - 320px);
  min-height: 560px;
  min-width: 0;
  overflow: visible;

  & > :first-child {
    flex: 1;
    min-height: 0;
  }

  @media (max-width: 1024px) {
    height: auto;
    min-height: 420px;
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
