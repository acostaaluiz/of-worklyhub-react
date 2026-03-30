import { Typography } from "antd";

import { BaseTemplate } from "@shared/base/base.template";
import { i18n as appI18n } from "@core/i18n";

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
import type { CompanyServiceModel } from "@modules/company/interfaces/service.model";
import type { EmployeeModel } from "@modules/people/interfaces/employee.model";
import type { InventoryItem } from "@modules/inventory/services/inventory-api";
import type { ScheduleEvent, InventoryItemLine } from "@modules/schedule/interfaces/schedule-event.model";
import type { ScheduleCategory } from "@modules/schedule/interfaces/schedule-category.model";
import type {
  MonthViewHint,
  NextScheduleItem,
  ScheduleStatus,
} from "@modules/schedule/services/schedules-api";
import type { ScheduleEventDraft } from "../../components/schedule-event-modal/schedule-event-modal.form.types";
import type { ScheduleWorkspaceSettings } from "@modules/schedule/interfaces/schedule-settings.model";

type ScheduleTemplateProps = {
  availableServices?: CompanyServiceModel[];
  availableEmployees?: EmployeeModel[];
  availableInventoryItems?: InventoryItem[];
  workspaceId?: string | null;
  onCreate?: (draft: ScheduleEventDraft) => Promise<void>;
  onUpdate?: (args: { id: string; event: Omit<ScheduleEvent, 'id'>; serviceIds?: string[]; employeeIds?: string[]; totalPriceCents?: number; workspaceId?: string | null; inventoryInputs?: InventoryItemLine[]; inventoryOutputs?: InventoryItemLine[] }) => Promise<void>;
  events?: ScheduleEvent[];
  onRangeChange?: (
    from: string,
    to: string,
    options?: {
      viewMode?: "month" | "week" | "day";
      includeViewHint?: boolean;
    }
  ) => Promise<ScheduleEvent[] | void>;
  monthViewHint?: MonthViewHint | null;
  categories?: ScheduleCategory[] | null;
  categoryCounts?: Record<string, number> | null;
  selectedCategoryIds?: Record<string, boolean> | null;
  onToggleCategory?: (id: string, checked: boolean) => void;
  onCreateCategory?: (input: {
    label: string;
    color?: string | null;
  }) => Promise<ScheduleCategory>;
  onUpdateCategory?: (input: {
    id: string;
    label: string;
    color?: string | null;
  }) => Promise<ScheduleCategory>;
  onDeleteCategory?: (id: string) => Promise<boolean>;
  nextSchedules?: NextScheduleItem[] | null;
  statuses?: ScheduleStatus[] | null;
  statusCounts?: Record<string, number> | null;
  selectedStatusIds?: Record<string, boolean> | null;
  onToggleStatus?: (id: string, checked: boolean) => void;
  settings?: ScheduleWorkspaceSettings;
};

import { Calendar as CalendarIcon } from "lucide-react";

export function ScheduleTemplate(props: ScheduleTemplateProps) {
        return (
    <>
      <BaseTemplate
        content={
          <>
            <PageStack>
            <TemplateTitleRow>
              <TemplateTitleBlock>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid color-mix(in srgb, var(--color-primary) 24%, var(--color-border))",
                      background: "color-mix(in srgb, var(--color-surface-2) 78%, transparent)",
                      boxShadow: "var(--shadow-sm)",
                      flexShrink: 0,
                    }}
                  >
                    <CalendarIcon size={22} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Typography.Title level={2} style={{ margin: 0 }}>
                      {appI18n.t("legacyInline.schedule.presentation_templates_schedule_schedule_template.k001")}
                    </Typography.Title>
                    <Typography.Text type="secondary">
                      {appI18n.t("legacyInline.schedule.presentation_templates_schedule_schedule_template.k002")}
                    </Typography.Text>
                  </div>
                </div>
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
                  onCreateCategory={props.onCreateCategory}
                  onUpdateCategory={props.onUpdateCategory}
                  onDeleteCategory={props.onDeleteCategory}
                  nextSchedules={props.nextSchedules}
                  statuses={props.statuses}
                  statusCounts={props.statusCounts}
                  selectedStatusIds={props.selectedStatusIds}
                  onToggleStatus={props.onToggleStatus}
                  settings={props.settings}
                />
              </SidebarCard>

              <ContentCard className="surface">
                <ScheduleCalendar
                  availableServices={props.availableServices}
                  availableEmployees={props.availableEmployees}
                  availableInventoryItems={props.availableInventoryItems}
                  workspaceId={props.workspaceId}
                  onCreate={props.onCreate}
                  onUpdate={props.onUpdate}
                  events={props.events}
                  categories={props.categories}
                  statuses={props.statuses}
                  settings={props.settings}
                  onRangeChange={props.onRangeChange}
                  monthViewHint={props.monthViewHint}
                />
              </ContentCard>
            </Shell>
          </PageStack>
        </>
          }
      />
    </>
  );
}
