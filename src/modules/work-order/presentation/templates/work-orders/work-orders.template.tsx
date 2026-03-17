import React from "react";
import { Typography } from "antd";
import { ClipboardList } from "lucide-react";
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
} from "./work-orders.template.styles";

type Props = {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  list: React.ReactNode;
  editor?: React.ReactNode;
  editorModal?: React.ReactNode;
};

export function WorkOrdersTemplate({
  title,
  description,
  actions,
  list,
  editor,
  editorModal,
}: Props) {
  const resolvedTitle =
    title ??
    appI18n.t("legacyInline.work_order.presentation_templates_work_orders_work_orders_template.title");
  const resolvedDescription =
    description ??
    appI18n.t("legacyInline.work_order.presentation_templates_work_orders_work_orders_template.description");

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
                  {resolvedTitle}
                </Typography.Title>
                <Typography.Text type="secondary">{resolvedDescription}</Typography.Text>
              </TemplateTitleCopy>
            </TemplateTitleBlock>

            {actions ? <div>{actions}</div> : null}
          </TemplateTitleRow>

          <Shell $hasEditor={Boolean(editor)}>
            <ListCard>{list}</ListCard>
            {editor ? <EditorCard>{editor}</EditorCard> : null}
          </Shell>
          {editorModal ?? null}
        </PageStack>
      }
    />
  );
}

export default WorkOrdersTemplate;
