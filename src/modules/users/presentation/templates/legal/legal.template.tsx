import type { ReactNode } from "react";
import { Typography, Button } from "antd";

import { BaseTemplate } from "@shared/base/base.template";
import { PublicFrameLayout } from "@shared/ui/layout/public-frame/public-frame.component";

import { FormCard, CardBody } from "../../components/presentation.styles";
import { LegalActions, LegalBody, LegalHeader, LegalMeta } from "./legal.template.styles";

type Props = {
  title: string;
  description?: string;
  updatedAt?: string;
  onBack?: () => void;
  onPrimary?: () => void;
  primaryLabel?: string;
  children?: ReactNode;
};

export function LegalTemplate({
  title,
  description,
  updatedAt,
  onBack,
  onPrimary,
  primaryLabel,
  children,
}: Props) {
  return (
    <BaseTemplate
      content={
        <PublicFrameLayout>
          <FormCard className="surface" styles={{ body: { padding: 0 } }}>
            <CardBody>
              <LegalHeader>
                <Typography.Title level={2} style={{ margin: 0 }}>
                  {title}
                </Typography.Title>
                {description ? (
                  <Typography.Text type="secondary">{description}</Typography.Text>
                ) : null}
                {updatedAt ? <LegalMeta>Last updated {updatedAt}</LegalMeta> : null}
              </LegalHeader>

              <LegalBody>{children}</LegalBody>

              {(onBack || onPrimary) ? (
                <LegalActions>
                  {onBack ? (
                    <Button onClick={onBack}>Back</Button>
                  ) : null}
                  {onPrimary ? (
                    <Button type="primary" onClick={onPrimary}>
                      {primaryLabel ?? "Continue"}
                    </Button>
                  ) : null}
                </LegalActions>
              ) : null}
            </CardBody>
          </FormCard>
        </PublicFrameLayout>
      }
    />
  );
}

export default LegalTemplate;
