import { Typography } from "antd";

import { BaseTemplate } from "@shared/base/base.template";
import { PrivateFrameLayout } from "@shared/ui/layout/private-frame/private-frame.component";

import {
  PageStack,
  Shell,
  SidebarCard,
  ContentCard,
  TemplateTitleRow,
  TemplateTitleBlock,
} from "./schedule.template.styles";

import { ScheduleCalendar } from "../../components/schedule-calendar/schedule-calendar.component";
import { ScheduleSidebar } from "../../components/schedule-sidebar/schedule-sidebar.component";

export function ScheduleTemplate() {
  return (
    <BaseTemplate
      content={
        <PrivateFrameLayout>
          <PageStack>
            <TemplateTitleRow>
              <TemplateTitleBlock>
                <Typography.Title level={2} style={{ margin: 0 }}>
                  My Calendar
                </Typography.Title>
                <Typography.Text type="secondary">
                  Manage events, categories and your company agenda in one
                  place.
                </Typography.Text>
              </TemplateTitleBlock>
            </TemplateTitleRow>

            <Shell>
              <SidebarCard className="surface">
                <ScheduleSidebar />
              </SidebarCard>

              <ContentCard className="surface">
                <ScheduleCalendar />
              </ContentCard>
            </Shell>
          </PageStack>
        </PrivateFrameLayout>
      }
    />
  );
}
