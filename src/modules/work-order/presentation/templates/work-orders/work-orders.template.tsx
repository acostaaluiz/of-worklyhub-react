import React from "react";
import { Typography } from "antd";
import { ClipboardList } from "lucide-react";

import { BaseTemplate } from "@shared/base/base.template";
import {
  PageStack,
  Shell,
  ListCard,
  EditorCard,
  TemplateTitleRow,
  TemplateTitleBlock,
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
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ClipboardList size={22} />
                <Typography.Title level={2} style={{ margin: 0 }}>
                  {title}
                </Typography.Title>
              </div>
              <Typography.Text type="secondary">{description}</Typography.Text>
            </TemplateTitleBlock>

            {actions ? <div>{actions}</div> : null}
          </TemplateTitleRow>

          <Shell>
            <ListCard className="surface">{list}</ListCard>
            <EditorCard className="surface">{editor}</EditorCard>
          </Shell>
        </PageStack>
      }
    />
  );
}

export default WorkOrdersTemplate;
