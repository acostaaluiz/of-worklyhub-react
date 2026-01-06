import { Modal, Typography, Button } from "antd";
import { CheckCircle2, AlertTriangle } from "lucide-react";
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

const IconWarn = styled(BaseIconWrap)`
  svg {
    color: var(--color-tertiary);
  }
`;

export type ResponseVariant = "success" | "warning" | "error";

type Props = {
  open: boolean;
  variant?: ResponseVariant;
  title: string;
  description?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  onClose: () => void;
  onPrimary: () => void;
};

export function ResponseModal({
  open,
  variant = "success",
  title,
  description,
  primaryLabel = "Ok",
  secondaryLabel = "Close",
  onClose,
  onPrimary,
}: Props) {
  const isSuccess = variant === "success";

  return (
    <Modal open={open} onCancel={onClose} footer={null} centered destroyOnHidden width={520}>
      <ModalRoot>
        <ModalContent>
          <HeadRow>
            {isSuccess ? (
              <IconWrap aria-hidden>
                <CheckCircle2 size={20} />
              </IconWrap>
            ) : (
              <IconWarn aria-hidden>
                <AlertTriangle size={20} />
              </IconWarn>
            )}

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
                {secondaryLabel}
              </Button>

              <Button size="large" type={isSuccess ? "primary" : "primary"} className="primary" onClick={onPrimary}>
                {primaryLabel}
              </Button>
            </Buttons>
          </FooterRow>
        </ModalContent>
      </ModalRoot>
    </Modal>
  );
}

export default ResponseModal;
