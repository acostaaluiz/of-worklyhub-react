import React from "react";
import { Modal, message } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import styled from "styled-components";
import { i18n as appI18n } from "@core/i18n";

import { BasePage } from "@shared/base/base.page";
import PageSkeleton from "@shared/ui/components/page-skeleton/page-skeleton.component";
import { companyService } from "@modules/company/services/company.service";
import { companyWorkspaceService } from "@modules/company/services/company-workspace.service";
import type { CompanyServiceModel } from "@modules/company/interfaces/service.model";
import { usersAuthService } from "@modules/users/services/auth.service";
import { PeopleService } from "@modules/people/services/people.service";
import type { EmployeeModel } from "@modules/people/interfaces/employee.model";
import { usersOverviewService } from "@modules/users/services/overview.service";
import { listInventoryItems } from "@modules/inventory/services/inventory.http.service";
import type { InventoryItem } from "@modules/inventory/services/inventory-api";
import type {
  CreateWorkOrderInput,
  ListWorkOrdersFilters,
  UpdateWorkOrderInput,
  WorkOrderListPagination,
  WorkOrder,
  WorkOrderPriority,
  WorkOrderOverview,
  WorkOrderRiskLevel,
  WorkOrderStatus,
} from "@modules/work-order/interfaces/work-order.model";
import {
  createWorkOrder,
  deleteWorkOrder,
  listWorkOrderOverview,
  listWorkOrderStatuses,
  listWorkOrdersPage,
  updateWorkOrder,
} from "@modules/work-order/services/work-order.http.service";
import WorkOrdersTemplate from "@modules/work-order/presentation/templates/work-orders/work-orders.template";
import WorkOrderList from "@modules/work-order/presentation/components/work-order-list/work-order-list.component";
import WorkOrderForm from "@modules/work-order/presentation/components/work-order-form/work-order-form.component";

type Filters = {
  search?: string;
  riskLevel?: WorkOrderRiskLevel;
  statusId?: string;
  priority?: WorkOrderPriority;
  dateFrom?: string;
  dateTo?: string;
};

const PAGE_SIZE = 24;

const WorkOrderEditorModal = styled(Modal)`
  .ant-modal-content {
    border-radius: var(--radius-lg);
    border: 1px solid color-mix(in srgb, var(--color-primary) 24%, var(--color-border));
    box-shadow: var(--shadow-elevated);
    background:
      radial-gradient(
        circle at 12% 0%,
        color-mix(in srgb, var(--color-primary) 12%, transparent),
        transparent 44%
      ),
      radial-gradient(
        circle at 88% 100%,
        color-mix(in srgb, var(--color-secondary) 10%, transparent),
        transparent 48%
      ),
      linear-gradient(
        150deg,
        color-mix(in srgb, var(--color-surface-2) 82%, transparent),
        var(--color-surface-elevated)
      );
    overflow: hidden;
  }
`;

function buildFilters(
  filters: Filters,
  pagination: { limit: number; offset: number }
): ListWorkOrdersFilters {
  const query: ListWorkOrdersFilters = {};
  if (filters.search) query.search = filters.search;
  if (filters.riskLevel) query.riskLevel = filters.riskLevel;
  if (filters.statusId) query.statusId = filters.statusId;
  if (filters.priority) query.priority = filters.priority;
  if (filters.dateFrom) query.scheduledFrom = filters.dateFrom;
  if (filters.dateTo) query.scheduledTo = filters.dateTo;
  query.limit = pagination.limit;
  query.offset = pagination.offset;
  return query;
}

function WorkOrdersPageContent(): React.ReactElement {
        const peopleService = React.useMemo(() => new PeopleService(), []);
  const [workspaceId, setWorkspaceId] = React.useState<string | undefined>(() => {
    const ws = companyService.getWorkspaceValue() as { workspaceId?: string; id?: string } | null;
    return (ws?.workspaceId ?? ws?.id) as string | undefined;
  });
  const [orders, setOrders] = React.useState<WorkOrder[]>([]);
  const [overview, setOverview] = React.useState<WorkOrderOverview | null>(null);
  const [statuses, setStatuses] = React.useState<WorkOrderStatus[]>([]);
  const [employees, setEmployees] = React.useState<EmployeeModel[]>([]);
  const [services, setServices] = React.useState<CompanyServiceModel[]>([]);
  const [inventoryItems, setInventoryItems] = React.useState<InventoryItem[]>([]);
  const [filters, setFilters] = React.useState<Filters>({});
  const [selected, setSelected] = React.useState<WorkOrder | null>(null);
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [listLoading, setListLoading] = React.useState(false);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [pagination, setPagination] = React.useState<WorkOrderListPagination>({
    limit: PAGE_SIZE,
    offset: 0,
    total: 0,
    hasMore: false,
    nextOffset: null,
  });
  const [saving, setSaving] = React.useState(false);
  const [initialLoading, setInitialLoading] = React.useState(true);
  const requestRef = React.useRef(0);
  const ordersRef = React.useRef<WorkOrder[]>([]);
  const filtersRef = React.useRef<Filters>({});

  const currentUserUid = usersAuthService.getSessionValue()?.uid ?? null;
  const currentUserName = usersOverviewService.getProfileValue()?.name ?? undefined;

  React.useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  React.useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  React.useEffect(() => {
    const sub = companyService.getWorkspace$().subscribe((ws) => {
      const nextId = (ws as DataMap)?.workspaceId ?? (ws as DataMap)?.id;
      setWorkspaceId(nextId as string | undefined);
    });
    return () => sub.unsubscribe();
  }, []);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (!workspaceId) {
        if (mounted) {
          setEmployees([]);
          setServices([]);
          setInventoryItems([]);
        }
        return;
      }

      try {
        const [employeesRows, servicesRows, inventoryRows] = await Promise.all([
          peopleService.listEmployees().catch(() => [] as EmployeeModel[]),
          companyWorkspaceService.listServices().catch(() => [] as CompanyServiceModel[]),
          listInventoryItems(workspaceId).catch(() => [] as InventoryItem[]),
        ]);
        if (!mounted) return;
        setEmployees(employeesRows ?? []);
        setServices(servicesRows ?? []);
        setInventoryItems(inventoryRows ?? []);
      } catch (err) {
        if (!mounted) return;
        setEmployees([]);
        setServices([]);
        setInventoryItems([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [workspaceId, peopleService]);

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
      message.error(appI18n.t("legacyInline.work_order.presentation_pages_work_orders_work_orders_page.k001"));
    }
  }, [workspaceId]);

  const fetchOverview = React.useCallback(async () => {
    if (!workspaceId) {
      setOverview(null);
      return;
    }

    try {
      const data = await listWorkOrderOverview(workspaceId, { dueSoonHours: 24, windowDays: 30 });
      setOverview(data);
    } catch (err) {
      message.error(appI18n.t("legacyInline.work_order.presentation_pages_work_orders_work_orders_page.k002"));
    }
  }, [workspaceId]);

  const refreshInventoryItems = React.useCallback(async () => {
    if (!workspaceId) {
      setInventoryItems([]);
      return;
    }
    try {
      const rows = await listInventoryItems(workspaceId);
      setInventoryItems(rows ?? []);
    } catch {
      // keep stale values if reload fails
    }
  }, [workspaceId]);

  const fetchOrders = React.useCallback(
    async (params?: { override?: Filters; mode?: "replace" | "append"; offset?: number }) => {
      if (!workspaceId) {
        setOrders([]);
        setPagination({
          limit: PAGE_SIZE,
          offset: 0,
          total: 0,
          hasMore: false,
          nextOffset: null,
        });
        return;
      }

      const mode = params?.mode ?? "replace";
      const nextFilters = params?.override ?? filtersRef.current;
      const nextOffset = params?.offset ?? 0;
      const requestId = ++requestRef.current;

      if (mode === "append") setLoadingMore(true);
      else setListLoading(true);

      try {
        const query = buildFilters(nextFilters, {
          limit: PAGE_SIZE,
          offset: nextOffset,
        });
        const page = await listWorkOrdersPage(workspaceId, query);
        if (requestId !== requestRef.current) return;

        if (mode === "append") {
          const current = ordersRef.current;
          const mergedMap = new Map<string, WorkOrder>();
          current.forEach((order) => mergedMap.set(order.id, order));
          (page.data ?? []).forEach((order) => mergedMap.set(order.id, order));
          const merged = Array.from(mergedMap.values());
          const appendedUniqueCount = merged.length - current.length;
          const exhaustedByDuplicates =
            (page.data?.length ?? 0) > 0 && appendedUniqueCount <= 0;
          setOrders(merged);
          setPagination({
            ...page.pagination,
            hasMore: page.pagination.hasMore && !exhaustedByDuplicates,
            nextOffset:
              page.pagination.hasMore && !exhaustedByDuplicates
                ? page.pagination.nextOffset
                : null,
          });
          return;
        }

        setOrders(page.data ?? []);
        setPagination(page.pagination);
      } catch (err) {
        message.error(appI18n.t("legacyInline.work_order.presentation_pages_work_orders_work_orders_page.k003"));
      } finally {
        if (mode === "append") setLoadingMore(false);
        else setListLoading(false);
      }
    },
    [workspaceId]
  );

  const fetchMoreOrders = React.useCallback(() => {
    if (!workspaceId) return;
    if (listLoading || loadingMore) return;
    if (!pagination.hasMore || pagination.nextOffset === null) return;
    fetchOrders({
      mode: "append",
      offset: pagination.nextOffset,
    });
  }, [
    workspaceId,
    listLoading,
    loadingMore,
    pagination.hasMore,
    pagination.nextOffset,
    fetchOrders,
  ]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setInitialLoading(true);
      await Promise.all([
        fetchStatuses(),
        fetchOrders({ mode: "replace", offset: 0 }),
        fetchOverview(),
      ]);
      if (mounted) setInitialLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [fetchOrders, fetchOverview, fetchStatuses]);

  const handleApplyFilters = () => {
    fetchOrders({ mode: "replace", offset: 0 });
  };

  const handleResetFilters = () => {
    setFilters({});
    fetchOrders({ override: {}, mode: "replace", offset: 0 });
  };

  const handleSubmit = async (payload: CreateWorkOrderInput | UpdateWorkOrderInput, id?: string) => {
    if (!workspaceId) return;

    setSaving(true);
    try {
      if (id) {
        const updated = await updateWorkOrder(workspaceId, id, {
          ...(payload as UpdateWorkOrderInput),
          workspaceId,
          updatedBy: (payload as UpdateWorkOrderInput).updatedBy ?? currentUserUid ?? undefined,
        });
        setSelected(updated ?? null);
        message.success(appI18n.t("legacyInline.work_order.presentation_pages_work_orders_work_orders_page.k004"));
      } else {
        const created = await createWorkOrder(workspaceId, {
          ...(payload as CreateWorkOrderInput),
          workspaceId,
          createdBy: (payload as CreateWorkOrderInput).createdBy ?? currentUserUid ?? undefined,
          requesterUserUid: (payload as CreateWorkOrderInput).requesterUserUid ?? undefined,
        });
        setSelected(created ?? null);
        message.success(appI18n.t("legacyInline.work_order.presentation_pages_work_orders_work_orders_page.k005"));
      }

      await Promise.all([
        fetchOrders({ mode: "replace", offset: 0 }),
        fetchOverview(),
        refreshInventoryItems(),
      ]);
    } catch (err) {
      message.error(appI18n.t("legacyInline.work_order.presentation_pages_work_orders_work_orders_page.k006"));
    } finally {
      setSaving(false);
    }
  };

  const handleOpenCreateModal = React.useCallback(() => {
    setSelected(null);
    setIsEditorOpen(true);
  }, []);

  const handleOpenEditModal = React.useCallback((order: WorkOrder) => {
    setSelected(order);
    setIsEditorOpen(true);
  }, []);

  const handleCloseEditorModal = React.useCallback(() => {
    setIsEditorOpen(false);
  }, []);

  const handleClearEditorForm = React.useCallback(() => {
    setSelected(null);
  }, []);

  const handleDelete = (order: WorkOrder) => {
    if (!workspaceId) return;

    Modal.confirm({
      title: appI18n.t("legacyInline.work_order.presentation_pages_work_orders_work_orders_page.k007", { title: order.title }),
      okText: appI18n.t("legacyInline.work_order.presentation_pages_work_orders_work_orders_page.k008"),
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteWorkOrder(workspaceId, order.id);
          if (selected?.id === order.id) {
            setSelected(null);
            setIsEditorOpen(false);
          }
          await Promise.all([
            fetchOrders({ mode: "replace", offset: 0 }),
            fetchOverview(),
            refreshInventoryItems(),
          ]);
          message.success(appI18n.t("legacyInline.work_order.presentation_pages_work_orders_work_orders_page.k009"));
        } catch (err) {
          message.error(appI18n.t("legacyInline.work_order.presentation_pages_work_orders_work_orders_page.k010"));
        }
      },
    });
  };

  if (initialLoading) {
    return <PageSkeleton mainRows={5} sideRows={5} height="100%" />;
  }

  return (
    <div data-cy="work-order-page">
      <WorkOrdersTemplate
        list={
          <WorkOrderList
            orders={orders}
            statuses={statuses}
            loading={listLoading}
            selectedId={selected?.id ?? null}
            filters={filters}
            overview={overview}
            hasMore={pagination.hasMore}
            loadingMore={loadingMore}
            onChangeFilters={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
            onApplyFilters={handleApplyFilters}
            onApplyFilterPatch={(patch) => {
              const next = { ...filters, ...patch };
              setFilters(next);
              fetchOrders({ override: next, mode: "replace", offset: 0 });
            }}
            onResetFilters={handleResetFilters}
            onLoadMore={fetchMoreOrders}
            onSelect={handleOpenEditModal}
            onCreate={handleOpenCreateModal}
            onDelete={handleDelete}
            onRefresh={() => fetchOrders({ mode: "replace", offset: 0 })}
          />
        }
        editorModal={
          <WorkOrderEditorModal
            open={isEditorOpen}
            onCancel={handleCloseEditorModal}
            footer={null}
            centered
            destroyOnClose
            width={1100}
            title={(
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--color-text-muted)",
                }}
              >
                {appI18n.t("legacyInline.work_order.presentation_pages_work_orders_work_orders_page.k011")}
              </span>
            )}
            closeIcon={<CloseOutlined style={{ fontSize: 16, color: "var(--color-text-muted)" }} />}
            styles={{
              header: {
                marginBottom: 0,
                borderBottom: "1px solid color-mix(in srgb, var(--color-primary) 18%, var(--color-divider))",
                background: "transparent",
                paddingTop: "10px",
                paddingBottom: "8px",
              },
              body: {
                paddingTop: "var(--space-3)",
                paddingLeft: "var(--space-4)",
                paddingRight: "var(--space-4)",
                paddingBottom: "var(--space-4)",
                height: "min(68vh, 720px)",
              },
            }}
            data-cy="work-order-editor-modal"
          >
            <div style={{ height: "100%" }}>
              <WorkOrderForm
                workspaceId={workspaceId}
                currentUserUid={currentUserUid}
                currentUserName={currentUserName}
                employees={employees}
                services={services}
                inventoryItems={inventoryItems}
                statuses={statuses}
                initial={selected ?? undefined}
                loading={saving}
                onSubmit={handleSubmit}
                onDelete={handleDelete}
                onCancel={handleClearEditorForm}
              />
            </div>
          </WorkOrderEditorModal>
        }
      />
    </div>
  );
}

export class WorkOrdersPage extends BasePage {
  protected override options = {
    title: `${appI18n.t("workOrder.pageTitles.workOrders")} | WorklyHub`,
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <WorkOrdersPageContent />;
  }
}

export default WorkOrdersPage;
