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
  grid-template-columns: minmax(0, 1fr) 420px;
  gap: var(--space-6);
  align-items: stretch;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

export const ListCard = styled.section`
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);

  height: calc(100vh - 320px);
  min-height: 520px;
  overflow: hidden;

  @media (max-width: 1200px) {
    height: auto;
    min-height: 480px;
    overflow: visible;
  }
`;

export const EditorCard = styled.section`
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);

  height: calc(100vh - 320px);
  min-height: 520px;
  overflow: hidden;

  @media (max-width: 1200px) {
    height: auto;
    min-height: 520px;
    overflow: visible;
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
`;
