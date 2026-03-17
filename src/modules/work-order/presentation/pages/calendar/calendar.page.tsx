import React from "react";
import dayjs from "dayjs";
import { message } from "antd";

import { i18n as appI18n } from "@core/i18n";
import { BasePage } from "@shared/base/base.page";
import PageSkeleton from "@shared/ui/components/page-skeleton/page-skeleton.component";
import { companyService } from "@modules/company/services/company.service";
import type { WorkOrder, WorkOrderStatus } from "@modules/work-order/interfaces/work-order.model";
import {
  listWorkOrders,
  listWorkOrderStatuses,
} from "@modules/work-order/services/work-order.http.service";
import { WorkOrderCalendarTemplate } from "@modules/work-order/presentation/templates/calendar/work-order-calendar.template";

function resolveOrderRangeMs(order: WorkOrder): { startMs: number; endMs: number } | null {
  const startRaw =
    order.scheduledStartAt ??
    order.scheduledEndAt ??
    order.dueAt ??
    order.createdAt ??
    null;
  if (!startRaw) return null;

  const start = dayjs(startRaw);
  if (!start.isValid()) return null;

  let end = order.scheduledEndAt ? dayjs(order.scheduledEndAt) : null;
  if (!end || !end.isValid()) {
    end = start;
  }

  const startMs = start.valueOf();
  let endMs = end.valueOf();
  if (Number.isNaN(startMs)) return null;
  if (Number.isNaN(endMs)) endMs = startMs;
  if (endMs < startMs) endMs = startMs;

  return { startMs, endMs };
}

function WorkOrderCalendarPageContent(): React.ReactElement {
        const [workspaceId, setWorkspaceId] = React.useState<string | undefined>(() => {
    const ws = companyService.getWorkspaceValue() as { workspaceId?: string; id?: string } | null;
    return (ws?.workspaceId ?? ws?.id) as string | undefined;
  });

  const [orders, setOrders] = React.useState<WorkOrder[]>([]);
  const [statuses, setStatuses] = React.useState<WorkOrderStatus[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [initialLoading, setInitialLoading] = React.useState(true);
  const rangeFilterSupportRef = React.useRef<boolean | null>(null);

  React.useEffect(() => {
    const sub = companyService.getWorkspace$().subscribe((ws) => {
      const nextId = (ws as DataMap)?.workspaceId ?? (ws as DataMap)?.id;
      setWorkspaceId(nextId as string | undefined);
    });
    return () => sub.unsubscribe();
  }, []);

  React.useEffect(() => {
    rangeFilterSupportRef.current = null;
  }, [workspaceId]);

  const fetchStatuses = React.useCallback(async () => {
    if (!workspaceId) {
      setStatuses([]);
      return;
    }

    try {
      const data = await listWorkOrderStatuses(workspaceId);
      const sorted = data.slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      setStatuses(sorted);
    } catch (err) {
      message.error(appI18n.t("legacyInline.work_order.presentation_pages_calendar_calendar_page.k001"));
    }
  }, [workspaceId]);

  const fetchRange = React.useCallback(
    async (from: string, to: string) => {
      if (!workspaceId) {
        setOrders([]);
        return;
      }

      const rangeStartMs = dayjs(from).startOf("day").valueOf();
      const rangeEndMs = dayjs(to).endOf("day").valueOf();
      const filterOrdersByRange = (data: WorkOrder[]) =>
        data.filter((order) => {
          const range = resolveOrderRangeMs(order);
          if (!range) return false;
          return range.endMs >= rangeStartMs && range.startMs <= rangeEndMs;
        });

      setLoading(true);
      try {
        let merged: WorkOrder[] = [];
        const rangeFilterSupported = rangeFilterSupportRef.current;

        if (rangeFilterSupported !== false) {
          const [scheduled, due] = await Promise.all([
            listWorkOrders(workspaceId, {
              scheduledFrom: from,
              scheduledTo: to,
              limit: 200,
              offset: 0,
            }),
            listWorkOrders(workspaceId, {
              dueFrom: from,
              dueTo: to,
              limit: 200,
              offset: 0,
            }),
          ]);

          const map = new Map<string, WorkOrder>();
          (scheduled ?? []).forEach((order) => map.set(order.id, order));
          (due ?? []).forEach((order) => map.set(order.id, order));
          merged = Array.from(map.values());

          if (rangeFilterSupported === null && merged.length > 0) {
            rangeFilterSupportRef.current = true;
          }
        }

        if (merged.length > 0) {
          setOrders(merged);
          return;
        }

        const fallback = await listWorkOrders(workspaceId, {
          limit: 200,
          offset: 0,
        });
        const filtered = filterOrdersByRange(fallback ?? []);
        setOrders(filtered);

        if (rangeFilterSupported === null && (fallback ?? []).length > 0) {
          rangeFilterSupportRef.current = false;
        }
      } catch (err) {
        message.error(appI18n.t("legacyInline.work_order.presentation_pages_calendar_calendar_page.k002"));
      } finally {
        setLoading(false);
      }
    },
    [workspaceId]
  );

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (!workspaceId) {
        if (mounted) {
          setInitialLoading(false);
          setOrders([]);
          setStatuses([]);
        }
        return;
      }

      setInitialLoading(true);
      const from = dayjs().startOf("month").format("YYYY-MM-DD");
      const to = dayjs().endOf("month").format("YYYY-MM-DD");

      await Promise.all([fetchStatuses(), fetchRange(from, to)]);

      if (mounted) setInitialLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [workspaceId, fetchStatuses, fetchRange]);

  if (initialLoading) {
    return <PageSkeleton mainRows={2} sideRows={0} height="100%" />;
  }

  return (
    <WorkOrderCalendarTemplate
      orders={orders}
      statuses={statuses}
      loading={loading}
      onRangeChange={fetchRange}
    />
  );
}

export class WorkOrderCalendarPage extends BasePage {
  protected override options = {
    title: `${appI18n.t("workOrder.pageTitles.calendar")} | WorklyHub`,
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <WorkOrderCalendarPageContent />;
  }
}

export default WorkOrderCalendarPage;
