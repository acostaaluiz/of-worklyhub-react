import { Typography } from "antd";
import { Calendar as CalendarIcon } from "lucide-react";

import { BaseTemplate } from "@shared/base/base.template";
import type { WorkOrder, WorkOrderStatus } from "@modules/work-order/interfaces/work-order.model";
import { WorkOrderCalendar } from "@modules/work-order/presentation/components/work-order-calendar/work-order-calendar.component";

import {
  PageStack,
  ContentCard,
  TemplateTitleRow,
  TemplateTitleBlock,
} from "./work-order-calendar.template.styles";

type Props = {
  orders: WorkOrder[];
  statuses?: WorkOrderStatus[];
  loading?: boolean;
  onRangeChange?: (from: string, to: string) => Promise<void>;
};

export function WorkOrderCalendarTemplate({
  orders,
  statuses,
  loading,
  onRangeChange,
}: Props) {
  return (
    <BaseTemplate
      content={
        <PageStack>
          <TemplateTitleRow>
            <TemplateTitleBlock>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CalendarIcon size={24} />
                <Typography.Title level={2} style={{ margin: 0 }}>
                  Work orders calendar
                </Typography.Title>
              </div>
              <Typography.Text type="secondary">
                Visualize scheduled and due work orders on a timeline.
              </Typography.Text>
            </TemplateTitleBlock>
          </TemplateTitleRow>

          <ContentCard className="surface">
            <WorkOrderCalendar
              orders={orders}
              statuses={statuses}
              loading={loading}
              onRangeChange={onRangeChange}
            />
          </ContentCard>
        </PageStack>
      }
    />
  );
}

export default WorkOrderCalendarTemplate;
