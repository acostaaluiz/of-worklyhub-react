import styled from "styled-components";

export const PageStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  min-height: 0;

  @media (max-width: 1024px) {
    gap: var(--space-3);
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

  @media (max-width: 640px) {
    align-items: flex-start;
    gap: var(--space-3);
    padding: 12px;
  }
`;

export const TemplateTitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  h2,
  h3 {
    font-weight: 900;
    letter-spacing: -0.01em;
  }
`;

export const FiltersCard = styled.div`
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  border: 1px solid color-mix(in srgb, var(--color-primary) 18%, var(--color-border));
  background:
    linear-gradient(
      140deg,
      color-mix(in srgb, var(--color-surface-2) 72%, transparent),
      var(--color-surface)
    );
  box-shadow: var(--shadow-sm);

  @media (max-width: 640px) {
    padding: var(--space-3);
  }
`;

export const ResultsCard = styled.div`
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  border: 1px solid color-mix(in srgb, var(--color-primary) 18%, var(--color-border));
  background:
    linear-gradient(
      140deg,
      color-mix(in srgb, var(--color-surface-2) 72%, transparent),
      var(--color-surface)
    );
  box-shadow: var(--shadow-sm);
  min-width: 0;
  overflow-x: auto;

  @media (max-width: 640px) {
    padding: var(--space-3);
  }
`;

export const HelperText = styled.p`
  margin: var(--space-2) 0 0;
  color: var(--color-text-muted);
  font-size: 13px;
`;
