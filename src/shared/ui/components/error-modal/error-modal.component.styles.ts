import styled from "styled-components";

export const ModalRoot = styled.div`
  .ant-modal-content {
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    box-shadow: var(--shadow-md);
    padding: var(--space-6);
  }

  .ant-modal-close {
    border-radius: var(--radius-sm);
  }

  .ant-modal-header {
    background: transparent;
  }

  .ant-modal-body {
    padding: 0;
  }
`;

export const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
`;

export const TitleRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
`;

export const IconWrap = styled.div`
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-glass-surface);

  display: inline-flex;
  align-items: center;
  justify-content: center;

  svg {
    color: var(--color-primary);
  }
`;

export const TextBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0;
`;

export const DetailsBox = styled.div`
  border: 1px solid var(--color-border);
  background: var(--color-glass-surface);
  border-radius: var(--radius-md);
  padding: var(--space-3);

  display: flex;
  flex-direction: column;
  gap: var(--space-2);

  font-size: var(--font-size-sm);
  color: var(--color-text-muted);

  code {
    font-family: var(--font-family-mono);
    color: var(--color-text);
    word-break: break-word;
  }
`;

export const FooterRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  flex-wrap: wrap;
`;
