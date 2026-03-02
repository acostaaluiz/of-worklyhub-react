import React from "react";
import { Users } from "lucide-react";
import { BaseTemplate } from "@shared/base/base.template";
import {
  ContentWrap,
  HeaderCopy,
  HeaderIcon,
  HeaderRow,
  HeaderSubtitle,
  HeaderTitle,
  TemplateShell,
} from "./people.template.styles";

export function PeopleTemplate(props: { title?: string; children?: React.ReactNode }) {
  const { title = "People", children } = props;
  return (
    <BaseTemplate
      content={
        <TemplateShell>
          <HeaderRow>
            <HeaderIcon>
              <Users size={20} />
            </HeaderIcon>
            <HeaderCopy>
              <HeaderTitle>{title}</HeaderTitle>
              <HeaderSubtitle>
                Manage team members, roles, and access in one place.
              </HeaderSubtitle>
            </HeaderCopy>
          </HeaderRow>
          <ContentWrap>{children}</ContentWrap>
        </TemplateShell>
      }
    />
  );
}

export default PeopleTemplate;
