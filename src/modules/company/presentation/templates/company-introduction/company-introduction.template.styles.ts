import styled from "styled-components";

export const TemplateShell = styled.div`
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);

  .wizard-wrap {
    flex: 1;
    min-height: 0;
  }

  @media (max-width: 900px) {
    height: auto;
    gap: var(--space-4);

    .wizard-wrap {
      min-height: auto;
    }
  }
`;

export const HeaderRow = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-lg);
  border: 1px solid color-mix(in srgb, var(--color-primary) 25%, var(--color-border));
  padding: var(--space-3);
  background:
    radial-gradient(circle at 14% 20%, rgba(30, 112, 255, 0.24), transparent 42%),
    radial-gradient(circle at 82% 82%, rgba(0, 214, 160, 0.2), transparent 46%),
    linear-gradient(
      140deg,
      color-mix(in srgb, var(--color-surface-2) 84%, transparent),
      var(--color-surface)
  );
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
`;

export const TemplateTitle = styled.h1`
  margin: 0;
  font-size: clamp(24px, 2.4vh, 30px);
  font-weight: 900;
  color: var(--color-text);
`;

export const TemplateSubtitle = styled.p`
  margin: 6px 0 0;
  color: var(--color-text-muted);
  line-height: var(--line-height-relaxed);
  max-width: 720px;
`;

export const HeaderHighlights = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-top: var(--space-3);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const HeaderHighlightCard = styled.div`
  border-radius: var(--radius-sm);
  border: 1px solid color-mix(in srgb, var(--color-primary) 18%, var(--color-border));
  background: color-mix(in srgb, var(--color-surface) 88%, transparent);
  padding: 8px 10px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const HeaderHighlightIcon = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--color-surface-2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const HeaderHighlightLabel = styled.div`
  font-size: 11px;
  color: var(--color-text-muted);
`;

export const HeaderHighlightValue = styled.div`
  margin-top: 1px;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.25;
`;
