import React from "react";
import { Typography } from "antd";
import { ClipboardList } from "lucide-react";

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
} from "./work-orders.template.styles";

type Props = {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  list: React.ReactNode;
  editor: React.ReactNode;
};

export function WorkOrdersTemplate({
  title = "Work orders",
  description = "Plan, execute, and monitor work orders from one place.",
  actions,
  list,
  editor,
}: Props) {
  return (
    <BaseTemplate
      content={
        <PageStack>
          <TemplateTitleRow>
            <TemplateTitleBlock>
              <TemplateIcon>
                <ClipboardList size={22} />
              </TemplateIcon>
              <TemplateTitleCopy>
                <Typography.Title level={2} style={{ margin: 0 }}>
                  {title}
                </Typography.Title>
                <Typography.Text type="secondary">{description}</Typography.Text>
              </TemplateTitleCopy>
            </TemplateTitleBlock>

            {actions ? <div>{actions}</div> : null}
          </TemplateTitleRow>

          <Shell>
            <ListCard>{list}</ListCard>
            <EditorCard>{editor}</EditorCard>
          </Shell>
        </PageStack>
      }
    />
  );
}

export default WorkOrdersTemplate;
