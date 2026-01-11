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

type ScheduleTemplateProps = {
  availableServices?: import("@modules/company/interfaces/service.model").CompanyServiceModel[];
  availableEmployees?: import("@modules/people/interfaces/employee.model").EmployeeModel[];
  workspaceId?: string | null;
  onCreate?: (draft: import("../../components/schedule-event-modal/schedule-event-modal.form.types").ScheduleEventDraft) => Promise<void>;
  events?: import("../../../interfaces/schedule-event.model").ScheduleEvent[];
  onRangeChange?: (from: string, to: string) => Promise<void>;
};

export function ScheduleTemplate(props: ScheduleTemplateProps) {
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
                <ScheduleSidebar availableServices={props.availableServices} availableEmployees={props.availableEmployees} workspaceId={props.workspaceId} onCreate={props.onCreate} />
              </SidebarCard>

              <ContentCard className="surface">
                <ScheduleCalendar availableServices={props.availableServices} availableEmployees={props.availableEmployees} workspaceId={props.workspaceId} onCreate={props.onCreate} events={props.events} onRangeChange={props.onRangeChange} />
              </ContentCard>
            </Shell>
          </PageStack>
        </PrivateFrameLayout>
      }
    />
  );
}
