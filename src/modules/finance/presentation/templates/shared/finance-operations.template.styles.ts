import styled from "styled-components";

export const TemplateShell = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  min-height: 0;
`;

export const HeaderRow = styled.div`
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
    radial-gradient(circle at 12% 18%, rgba(30, 112, 255, 0.14), transparent 38%),
    radial-gradient(circle at 86% 86%, rgba(0, 214, 160, 0.12), transparent 42%),
    linear-gradient(
      140deg,
      color-mix(in srgb, var(--color-surface-2) 80%, transparent),
      var(--color-surface)
    );
  box-shadow: var(--shadow-sm);
`;

export const HeaderMain = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

export const HeaderIcon = styled.span`
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

export const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.75fr);
  gap: var(--space-4);
  align-items: stretch;
  min-height: 0;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

const panelStyles = `
  border-radius: var(--radius-lg);
  border: 1px solid color-mix(in srgb, var(--color-primary) 18%, var(--color-border));
  background:
    linear-gradient(
      140deg,
      color-mix(in srgb, var(--color-surface-2) 72%, transparent),
      var(--color-surface)
    );
  box-shadow: var(--shadow-sm);
`;

export const MainPanel = styled.section`
  ${panelStyles}
  padding: var(--space-4);
  min-height: 0;
`;

export const SidePanel = styled.aside`
  ${panelStyles}
  padding: var(--space-4);
  min-height: 0;
`;

export const SidePanelInner = styled.div`
  width: 100%;
  max-width: 420px;
  min-width: 0;
`;

