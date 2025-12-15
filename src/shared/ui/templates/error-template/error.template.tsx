import { Button, Typography } from "antd";
import { AlertCircle } from "lucide-react";

import type { AppError } from "@core/errors/app-error";

import {
  TemplateShell,
  TemplateCard,
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
        <div
          style={{
            display: "flex",
            gap: "var(--space-3)",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              background: "var(--color-glass-surface)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "0 0 auto",
            }}
            aria-hidden
          >
            <AlertCircle size={22} />
          </div>

          <div style={{ minWidth: 0 }}>
            <Typography.Title level={3} style={{ margin: 0 }}>
              {resolvedTitle}
            </Typography.Title>
            <Typography.Text type="secondary">
              {resolvedDescription}
            </Typography.Text>
          </div>
        </div>

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
            <Button
              size="large"
              style={{ borderRadius: "var(--radius-sm)" }}
              onClick={onBack}
            >
              Back
            </Button>
          )}

          {onRetry && (
            <Button
              size="large"
              type="primary"
              style={{ borderRadius: "var(--radius-sm)" }}
              onClick={onRetry}
            >
              Try again
            </Button>
          )}
        </Actions>
      </TemplateCard>
    </TemplateShell>
  );
}
