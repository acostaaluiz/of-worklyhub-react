import React from "react";
import { message } from "antd";

import { i18n as appI18n } from "@core/i18n";
import { BasePage } from "@shared/base/base.page";
import PageSkeleton from "@shared/ui/components/page-skeleton/page-skeleton.component";
import { companyService } from "@modules/company/services/company.service";
import type { WorkOrderStatus } from "@modules/work-order/interfaces/work-order.model";
import {
  createWorkOrderStatus,
  listWorkOrderStatuses,
} from "@modules/work-order/services/work-order.http.service";
import WorkOrderStatusesTemplate from "@modules/work-order/presentation/templates/statuses/statuses.template";
import WorkOrderStatusesList from "@modules/work-order/presentation/components/work-order-statuses/work-order-statuses-list.component";
import WorkOrderStatusForm from "@modules/work-order/presentation/components/work-order-statuses/work-order-statuses-form.component";

function WorkOrderStatusesPageContent(): React.ReactElement {
        const [workspaceId, setWorkspaceId] = React.useState<string | undefined>(() => {
    const ws = companyService.getWorkspaceValue() as { workspaceId?: string; id?: string } | null;
    return (ws?.workspaceId ?? ws?.id) as string | undefined;
  });
  const [statuses, setStatuses] = React.useState<WorkOrderStatus[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [initialLoading, setInitialLoading] = React.useState(true);

  React.useEffect(() => {
    const sub = companyService.getWorkspace$().subscribe((ws) => {
      const nextId = (ws as DataMap)?.workspaceId ?? (ws as DataMap)?.id;
      setWorkspaceId(nextId as string | undefined);
    });
    return () => sub.unsubscribe();
  }, []);

  const fetchStatuses = React.useCallback(async () => {
    if (!workspaceId) {
      setStatuses([]);
      return;
    }

    setLoading(true);
    try {
      const data = await listWorkOrderStatuses(workspaceId);
      const sorted = data.slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      setStatuses(sorted);
    } catch (err) {
      message.error(appI18n.t("legacyInline.work_order.presentation_pages_statuses_statuses_page.k001"));
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setInitialLoading(true);
      await fetchStatuses();
      if (mounted) setInitialLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [fetchStatuses]);

  const handleCreateStatus = async (payload: { code: string; label: string; isTerminal?: boolean; sortOrder?: number }) => {
    if (!workspaceId) return;

    setSaving(true);
    try {
      const created = await createWorkOrderStatus(workspaceId, payload);
      setStatuses((prev) => [created, ...prev].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));
      message.success(appI18n.t("legacyInline.work_order.presentation_pages_statuses_statuses_page.k002"));
    } catch (err) {
      message.error(appI18n.t("legacyInline.work_order.presentation_pages_statuses_statuses_page.k003"));
    } finally {
      setSaving(false);
    }
  };

  if (initialLoading) {
    return <PageSkeleton mainRows={4} sideRows={4} height="100%" />;
  }

  return (
    <div data-cy="work-order-statuses-page">
      <WorkOrderStatusesTemplate
        list={<WorkOrderStatusesList statuses={statuses} loading={loading} />}
        form={<WorkOrderStatusForm loading={saving} onSubmit={handleCreateStatus} />}
      />
    </div>
  );
}

export class WorkOrderStatusesPage extends BasePage {
  protected override options = {
    title: `${appI18n.t("workOrder.pageTitles.statuses")} | WorklyHub`,
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <WorkOrderStatusesPageContent />;
  }
}

export default WorkOrderStatusesPage;
