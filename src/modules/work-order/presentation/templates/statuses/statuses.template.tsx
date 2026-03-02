import React from "react";
import { Typography } from "antd";
import { ListChecks } from "lucide-react";

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
                  Work order statuses
                </Typography.Title>
                <Typography.Text type="secondary">
                  Configure stages and default workflow for your work orders.
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
