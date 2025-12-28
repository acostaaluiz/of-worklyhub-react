import { Button, Typography } from "antd";
import { AlertCircle } from "lucide-react";

import type { AppError } from "@core/errors/app-error";

import {
  TemplateShell,
  TemplateCard,
  HeadRow,
  IconWrap,
  TextBlock,
  Actions,
  Details,
} from "./error.template.styles";

type Props = {
  title?: string;
  description?: string;
  error?: AppError | null;
  onBack?: () => void;
  onRetry?: () => void;
};

export function ErrorTemplate({
  title,
  description,
  error,
  onBack,
  onRetry,
}: Props) {
  const resolvedTitle = title ?? "Something went wrong";
  const resolvedDescription =
    description ??
    "An unexpected error occurred. Please try again. If the problem persists, contact support.";

  return (
    <TemplateShell>
      <TemplateCard className="surface">
        <HeadRow>
          <IconWrap aria-hidden>
            <AlertCircle size={22} />
          </IconWrap>

          <TextBlock>
            <Typography.Title level={3} style={{ margin: 0 }}>
              {resolvedTitle}
            </Typography.Title>
            <Typography.Text type="secondary">
              {resolvedDescription}
            </Typography.Text>
          </TextBlock>
        </HeadRow>

        {(error?.correlationId ||
          typeof error?.statusCode === "number" ||
          error?.code) && (
          <Details>
            {typeof error?.statusCode === "number" && (
              <div>
                <Typography.Text type="secondary">Status</Typography.Text>{" "}
                <code>{String(error.statusCode)}</code>
              </div>
            )}

            {error?.correlationId && (
              <div>
                <Typography.Text type="secondary">
                  Correlation ID
                </Typography.Text>{" "}
                <code>{error.correlationId}</code>
              </div>
            )}

            {error?.code && (
              <div>
                <Typography.Text type="secondary">Code</Typography.Text>{" "}
                <code>{error.code}</code>
              </div>
            )}
          </Details>
        )}

        <Actions>
          {onBack && (
            <Button size="large" onClick={onBack}>
              Back
            </Button>
          )}

          {onRetry && (
            <Button size="large" type="primary" onClick={onRetry}>
              Try again
            </Button>
          )}
        </Actions>
      </TemplateCard>
    </TemplateShell>
  );
}
