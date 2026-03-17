import React from "react";
import { Typography } from "antd";
import { ListChecks } from "lucide-react";

import { i18n as appI18n } from "@core/i18n";
import { BaseTemplate } from "@shared/base/base.template";
import {
  PageStack,
  Shell,
  ListCard,
  EditorCard,
  TemplateIcon,
  TemplateTitleRow,
  TemplateTitleBlock,
  TemplateTitleCopy,
} from "@modules/work-order/presentation/templates/work-orders/work-orders.template.styles";

type Props = {
  list: React.ReactNode;
  form: React.ReactNode;
  actions?: React.ReactNode;
};

export function WorkOrderStatusesTemplate({ list, form, actions }: Props) {
        return (
    <BaseTemplate
      content={
        <PageStack>
          <TemplateTitleRow>
            <TemplateTitleBlock>
              <TemplateIcon>
                <ListChecks size={22} />
              </TemplateIcon>
              <TemplateTitleCopy>
                <Typography.Title level={2} style={{ margin: 0 }}>
                  {appI18n.t("legacyInline.work_order.presentation_templates_statuses_statuses_template.k001")}
                </Typography.Title>
                <Typography.Text type="secondary">
                  {appI18n.t("legacyInline.work_order.presentation_templates_statuses_statuses_template.k002")}
                </Typography.Text>
              </TemplateTitleCopy>
            </TemplateTitleBlock>
            {actions ? <div>{actions}</div> : null}
          </TemplateTitleRow>

          <Shell>
            <ListCard>{list}</ListCard>
            <EditorCard>{form}</EditorCard>
          </Shell>
        </PageStack>
      }
    />
  );
}

export default WorkOrderStatusesTemplate;
