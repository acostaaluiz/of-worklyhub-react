import { Modal, Typography, Button } from "antd";
import { XCircle } from "lucide-react";
import {
  ModalRoot,
  ModalContent,
  HeadRow,
  IconWrap as BaseIconWrap,
  TextBlock,
  FooterRow,
  Buttons,
} from "@shared/styles/modal/modal.styles";
import styled from "styled-components";

const IconWrap = styled(BaseIconWrap)`
  svg {
    color: var(--color-secondary);
  }
`;

type Props = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onClose: () => void;
  onConfirm?: () => void; // not wired by default, optional for now
};

export function ConfirmationModal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onClose,
  onConfirm,
}: Props) {
  return (
    <Modal open={open} onCancel={onClose} footer={null} centered destroyOnHidden width={520}>
      <ModalRoot>
        <ModalContent>
          <HeadRow>
            <IconWrap aria-hidden>
              <XCircle size={20} />
            </IconWrap>

            <TextBlock>
              <Typography.Title level={4} style={{ margin: 0 }}>
                {title}
              </Typography.Title>
              {description ? <Typography.Text type="secondary">{description}</Typography.Text> : null}
            </TextBlock>
          </HeadRow>

          <FooterRow>
            <Buttons>
              <Button size="large" className="secondary" onClick={onClose}>
                {cancelLabel}
              </Button>

              <Button size="large" type="primary" className="primary" onClick={() => onConfirm?.()}>
                {confirmLabel}
              </Button>
            </Buttons>
          </FooterRow>
        </ModalContent>
      </ModalRoot>
    </Modal>
  );
}

export default ConfirmationModal;
