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

  .ant-modal-close-x {
    width: 36px;
    height: 36px;
    line-height: 36px;
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
  gap: var(--space-5);
`;

export const HeadRow = styled.div`
  display: grid;
  grid-template-columns: 44px 1fr;
  align-items: flex-start;
  gap: var(--space-3);
`;

export const IconWrap = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: var(--color-glass-surface);

  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

export const TextBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0;
`;

export const FooterRow = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const Buttons = styled.div`
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
  justify-content: flex-end;

  .ant-btn {
    height: 44px;
    border-radius: var(--radius-sm);
    padding-inline: 16px;
    min-width: 140px;
  }

  .ant-btn.secondary {
    background: transparent;
  }
`;
