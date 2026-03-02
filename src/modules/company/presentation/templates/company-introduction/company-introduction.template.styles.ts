import styled from "styled-components";

export const TemplateShell = styled.div`
  width: 100%;

  @media (max-width: 640px) {
    padding-inline: 2px;
  }
`;

export const HeaderRow = styled.div`
  position: relative;
  overflow: hidden;
  margin-bottom: var(--space-4);
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
    padding: 12px;
  }
`;

export const TemplateTitle = styled.h1`
  margin: 0;
  font-size: 22px;
  font-weight: 900;
  color: var(--color-text);

  @media (max-width: 640px) {
    font-size: 20px;
  }
`;

export const TemplateSubtitle = styled.p`
  margin: 6px 0 0;
  color: var(--color-text-muted);
  line-height: var(--line-height-relaxed);
`;
