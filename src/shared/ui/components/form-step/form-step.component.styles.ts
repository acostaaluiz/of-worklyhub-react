import styled from "styled-components";

export const WizardShell = styled.div`
  width: 100%;
  height: 100%;
  min-height: 0;

  @media (max-width: 900px) {
    height: auto;
  }
`;

export const WizardGrid = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: var(--space-3);
  align-items: stretch;
  height: 100%;
  min-height: 0;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    height: auto;
  }
`;

export const WizardSidebar = styled.aside`
  border-radius: var(--radius-lg);
  border: 1px solid color-mix(in srgb, var(--color-primary) 18%, var(--color-border));
  background: color-mix(in srgb, var(--color-surface) 94%, transparent);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  padding: var(--space-3);
  display: flex;
  flex-direction: column;
  min-height: 0;

  @media (max-width: 900px) {
    padding: var(--space-3);
  }
`;

export const WizardSidebarHeader = styled.div`
  margin-bottom: var(--space-3);
`;

export const WizardSidebarTitle = styled.div`
  font-size: var(--font-size-lg);
  font-weight: 900;
  color: var(--color-text);
`;

export const WizardSidebarSubtitle = styled.div`
  margin-top: 4px;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  line-height: var(--line-height-relaxed);
`;

export const StepsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const WizardContent = styled.section`
  border-radius: var(--radius-lg);
  border: 1px solid color-mix(in srgb, var(--color-primary) 18%, var(--color-border));
  background: color-mix(in srgb, var(--color-surface) 96%, transparent);
  box-shadow: var(--shadow-sm);
  overflow: hidden;

  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  min-height: 0;

  @media (max-width: 900px) {
    padding: var(--space-3);
  }
`;

export const ContentHeader = styled.div`
  margin-bottom: var(--space-3);
  flex-shrink: 0;
`;

export const ContentTitle = styled.h2`
  margin: 0;
  font-size: clamp(20px, 2.1vh, 24px);
  font-weight: 900;
  color: var(--color-text);
`;

export const ContentDescription = styled.p`
  margin: 6px 0 0;
  color: var(--color-text-muted);
  line-height: var(--line-height-relaxed);
`;

export const WizardContentBody = styled.div`
  min-height: 0;
  flex: 1;

  .ant-form-item {
    margin-bottom: var(--space-3);
  }

  .ant-tabs {
    margin-top: 6px;
  }
`;

export const FooterRow = styled.div`
  margin-top: var(--space-3);
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
  flex-shrink: 0;

  @media (max-width: 520px) {
    flex-direction: column-reverse;
    > * {
      width: 100%;
    }
  }
`;

export const RightActions = styled.div`
  display: inline-flex;
  gap: var(--space-2);
  align-items: center;

  @media (max-width: 520px) {
    width: 100%;
    > * {
      width: 100%;
    }
  }
`;
