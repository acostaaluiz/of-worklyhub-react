import styled from "styled-components";

import {
  ModalRoot as BaseModalRoot,
  ModalContent,
  HeadRow,
  IconWrap as BaseIconWrap,
  TextBlock,
  FooterRow,
  Buttons,
} from "@shared/styles/modal/modal.styles";

export { ModalContent, HeadRow, TextBlock, FooterRow, Buttons };

export const ModalRoot = BaseModalRoot;

export const IconWrap = styled(BaseIconWrap)`
  svg {
    color: var(--color-primary);
  }

  &[data-severity="warning"] svg {
    color: var(--color-secondary);
  }

  &[data-severity="error"] svg {
    color: var(--color-tertiary);
  }
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
