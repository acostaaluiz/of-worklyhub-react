import { Modal, Typography, Button } from "antd";
import { AlertCircle, ShieldAlert, WifiOff, Info } from "lucide-react";

import type { AppError } from "@core/errors/app-error";
import type { ErrorSeverity } from "@shared/providers/error/error.types";

import {
  ModalRoot,
  ModalContent,
  TitleRow,
  IconWrap,
  TextBlock,
  DetailsBox,
  FooterRow,
} from "./error-modal.component.styles";

type Props = {
  open: boolean;
  title: string;
  description: string;
  severity: ErrorSeverity;
  actionLabel: string;
  canRetry: boolean;
  showDetails: boolean;
  error: AppError | null;
  onClose: () => void;
  onPrimary: () => void;
};

function pickIcon(severity: ErrorSeverity, kind?: string) {
  if (kind === "Network") return <WifiOff size={20} />;
  if (kind === "Unauthorized" || kind === "Forbidden")
    return <ShieldAlert size={20} />;
  if (severity === "info") return <Info size={20} />;
  return <AlertCircle size={20} />;
}

export function ErrorModal({
  open,
  title,
  description,
  severity,
  actionLabel,
  showDetails,
  error,
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
          <TitleRow>
            <IconWrap aria-hidden>{pickIcon(severity, error?.kind)}</IconWrap>

            <TextBlock>
              <Typography.Title level={4} style={{ margin: 0 }}>
                {title}
              </Typography.Title>
              <Typography.Text type="secondary">{description}</Typography.Text>
            </TextBlock>
          </TitleRow>

          {showDetails && error && (
            <DetailsBox>
              {typeof error.statusCode === "number" && (
                <div>
                  <Typography.Text type="secondary">Status</Typography.Text>{" "}
                  <code>{String(error.statusCode)}</code>
                </div>
              )}

              {error.correlationId && (
                <div>
                  <Typography.Text type="secondary">
                    Correlation ID
                  </Typography.Text>{" "}
                  <code>{error.correlationId}</code>
                </div>
              )}

              {error.code && (
                <div>
                  <Typography.Text type="secondary">Code</Typography.Text>{" "}
                  <code>{error.code}</code>
                </div>
              )}
            </DetailsBox>
          )}

          <FooterRow>
            <Button
              size="large"
              style={{ borderRadius: "var(--radius-sm)" }}
              onClick={onClose}
            >
              Close
            </Button>

            <Button
              size="large"
              type="primary"
              onClick={onPrimary}
              style={{ borderRadius: "var(--radius-sm)" }}
            >
              {actionLabel}
            </Button>
          </FooterRow>
        </ModalContent>
      </ModalRoot>
    </Modal>
  );
}
