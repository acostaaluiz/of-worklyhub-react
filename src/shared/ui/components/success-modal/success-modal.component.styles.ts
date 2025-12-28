import styled from "styled-components";

import {
  ModalRoot,
  ModalContent,
  HeadRow,
  IconWrap as BaseIconWrap,
  TextBlock,
  FooterRow,
  Buttons,
} from "@shared/styles/modal/modal.styles";

export { ModalRoot, ModalContent, HeadRow, TextBlock, FooterRow, Buttons };

export const IconWrap = styled(BaseIconWrap)`
  svg {
    color: var(--color-secondary);
  }
`;
