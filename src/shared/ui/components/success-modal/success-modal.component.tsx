import { Modal, Typography, Button } from "antd";
import { CheckCircle2 } from "lucide-react";
import {
  Buttons,
  FooterRow,
  HeadRow,
  IconWrap,
  ModalContent,
  ModalRoot,
  TextBlock,
} from "./success-modal.component.styles";

type Props = {
  open: boolean;
  title: string;
  description: string;
  actionLabel: string;
  onClose: () => void;
  onPrimary: () => void;
};

export function SuccessModal({
  open,
  title,
  description,
  actionLabel,
  onClose,
  onPrimary,
}: Props) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      destroyOnHidden
      width={520}
    >
      <ModalRoot>
        <ModalContent>
          <HeadRow>
            <IconWrap aria-hidden>
              <CheckCircle2 size={20} />
            </IconWrap>

            <TextBlock>
              <Typography.Title level={4} style={{ margin: 0 }}>
                {title}
              </Typography.Title>

              <Typography.Text type="secondary">{description}</Typography.Text>
            </TextBlock>
          </HeadRow>

          <FooterRow>
            <Buttons>
              <Button size="large" className="secondary" onClick={onClose}>
                Close
              </Button>

              <Button
                size="large"
                type="primary"
                className="primary"
                onClick={onPrimary}
              >
                {actionLabel}
              </Button>
            </Buttons>
          </FooterRow>
        </ModalContent>
      </ModalRoot>
    </Modal>
  );
}
