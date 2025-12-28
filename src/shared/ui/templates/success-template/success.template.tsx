import { Button, Typography } from "antd";
import { CheckCircle2 } from "lucide-react";

import {
  TemplateShell,
  TemplateCard,
  HeadRow,
  IconWrap,
  TextBlock,
  Actions,
  Details,
} from "./success.template.styles";

type SuccessDetails = {
  correlationId?: string;
  code?: string;
  meta?: unknown;
};

type Props = {
  title?: string;
  description?: string;

  details?: SuccessDetails | null;

  primaryActionLabel?: string;
  secondaryActionLabel?: string;

  onPrimary?: () => void;
  onSecondary?: () => void;
};

export function SuccessTemplate({
  title,
  description,
  details,
  primaryActionLabel,
  secondaryActionLabel,
  onPrimary,
  onSecondary,
}: Props) {
  const resolvedTitle = title ?? "Success";
  const resolvedDescription =
    description ?? "Your request was completed successfully.";

  const showDetails = Boolean(details?.correlationId || details?.code);

  return (
    <TemplateShell>
      <TemplateCard className="surface">
        <HeadRow>
          <IconWrap aria-hidden>
            <CheckCircle2 size={22} />
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

        {showDetails && (
          <Details>
            {details?.code && (
              <div>
                <Typography.Text type="secondary">Code</Typography.Text>{" "}
                <code>{details.code}</code>
              </div>
            )}

            {details?.correlationId && (
              <div>
                <Typography.Text type="secondary">
                  Correlation ID
                </Typography.Text>{" "}
                <code>{details.correlationId}</code>
              </div>
            )}
          </Details>
        )}

        <Actions>
          {onSecondary && (
            <Button size="large" onClick={onSecondary}>
              {secondaryActionLabel ?? "Back"}
            </Button>
          )}

          {onPrimary && (
            <Button size="large" type="primary" onClick={onPrimary}>
              {primaryActionLabel ?? "Continue"}
            </Button>
          )}
        </Actions>
      </TemplateCard>
    </TemplateShell>
  );
}
