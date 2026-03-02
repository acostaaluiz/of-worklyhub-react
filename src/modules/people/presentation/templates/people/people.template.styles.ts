import styled from "styled-components";

export const TemplateShell = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: 16px;

  @media (max-width: 1024px) {
    padding: 14px;
    gap: var(--space-3);
  }

  @media (max-width: 640px) {
    padding: 10px;
  }
`;

export const HeaderRow = styled.div`
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: var(--radius-lg);
  border: 1px solid color-mix(in srgb, var(--color-primary) 24%, var(--color-border));
  padding: 14px 16px;
  background:
    radial-gradient(circle at 12% 18%, rgba(30, 112, 255, 0.14), transparent 38%),
    radial-gradient(circle at 86% 86%, rgba(0, 214, 160, 0.12), transparent 42%),
    linear-gradient(
      140deg,
      color-mix(in srgb, var(--color-surface-2) 80%, transparent),
      var(--color-surface)
    );
  box-shadow: var(--shadow-sm);

  @media (max-width: 640px) {
    align-items: flex-start;
    padding: 12px;
  }
`;

export const HeaderIcon = styled.span`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid color-mix(in srgb, var(--color-primary) 24%, var(--color-border));
  background: color-mix(in srgb, var(--color-surface-2) 78%, transparent);
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
`;

export const HeaderCopy = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

export const HeaderTitle = styled.h2`
  margin: 0;
`;

export const HeaderSubtitle = styled.p`
  margin: 0;
  color: var(--color-text-muted);
`;

export const ContentWrap = styled.div`
  min-width: 0;
  overflow-x: auto;
`;
