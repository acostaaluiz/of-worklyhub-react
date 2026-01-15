import { Typography } from "antd";

import { BaseTemplate } from "@shared/base/base.template";

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
  onUpdate?: (args: { id: string; event: Omit<import("../../../interfaces/schedule-event.model").ScheduleEvent, 'id'>; serviceIds?: string[]; employeeIds?: string[]; totalPriceCents?: number; workspaceId?: string | null }) => Promise<void>;
  events?: import("../../../interfaces/schedule-event.model").ScheduleEvent[];
  onRangeChange?: (from: string, to: string) => Promise<void>;
  categories?: import("@modules/schedule/interfaces/schedule-category.model").ScheduleCategory[] | null;
  categoryCounts?: Record<string, number> | null;
  selectedCategoryIds?: Record<string, boolean> | null;
  onToggleCategory?: (id: string, checked: boolean) => void;
  nextSchedules?: import("@modules/schedule/services/schedules-api").NextScheduleItem[] | null;
  statuses?: import("@modules/schedule/services/schedules-api").ScheduleStatus[] | null;
  statusCounts?: Record<string, number> | null;
  selectedStatusIds?: Record<string, boolean> | null;
  onToggleStatus?: (id: string, checked: boolean) => void;
};

export function ScheduleTemplate(props: ScheduleTemplateProps) {
  return (
    <BaseTemplate
      content={
        <>
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
                <ScheduleSidebar
                  availableServices={props.availableServices}
                  availableEmployees={props.availableEmployees}
                  workspaceId={props.workspaceId}
                  onCreate={props.onCreate}
                  categories={props.categories}
                  categoryCounts={props.categoryCounts}
                  selectedCategoryIds={props.selectedCategoryIds}
                  onToggleCategory={props.onToggleCategory}
                  nextSchedules={props.nextSchedules}
                  statuses={props.statuses}
                  statusCounts={props.statusCounts}
                  selectedStatusIds={props.selectedStatusIds}
                  onToggleStatus={props.onToggleStatus}
                />
              </SidebarCard>

              <ContentCard className="surface">
                <ScheduleCalendar
                  availableServices={props.availableServices}
                  availableEmployees={props.availableEmployees}
                  workspaceId={props.workspaceId}
                  onCreate={props.onCreate}
                  onUpdate={props.onUpdate}
                  events={props.events}
                  categories={props.categories}
                  statuses={props.statuses}
                  onRangeChange={props.onRangeChange}
                />
              </ContentCard>
            </Shell>
          </PageStack>
        </>
      }
    />
  );
}
