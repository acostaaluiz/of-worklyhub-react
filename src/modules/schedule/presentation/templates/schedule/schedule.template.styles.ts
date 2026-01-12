import styled from "styled-components";

export const PageStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  min-height: calc(100vh - 220px);

  @media (max-width: 768px) {
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
    min-height: 560px;
    overflow: visible;

    & > :first-child {
      min-height: auto;
    }
  }
`;

export const TemplateTitleRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-4);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const TemplateTitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
`;

export const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: var(--color-divider);
  margin: var(--space-2) 0;
`;
