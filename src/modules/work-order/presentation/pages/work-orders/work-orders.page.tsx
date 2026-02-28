import React from "react";
import { Modal, message } from "antd";

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
  listWorkOrders,
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
};

function buildFilters(filters: Filters): ListWorkOrdersFilters {
  const query: ListWorkOrdersFilters = {};
  if (filters.search) query.search = filters.search;
  if (filters.riskLevel) query.riskLevel = filters.riskLevel;
  if (filters.statusId) query.statusId = filters.statusId;
  if (filters.priority) query.priority = filters.priority;
  query.limit = 100;
  query.offset = 0;
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
  const [listLoading, setListLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [initialLoading, setInitialLoading] = React.useState(true);

  const currentUserUid = usersAuthService.getSessionValue()?.uid ?? null;
  const currentUserName = usersOverviewService.getProfileValue()?.name ?? undefined;

  React.useEffect(() => {
    const sub = companyService.getWorkspace$().subscribe((ws) => {
      const nextId = (ws as any)?.workspaceId ?? (ws as any)?.id;
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
      message.error("Failed to load work order statuses.");
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
      message.error("Failed to load work order overview.");
    }
  }, [workspaceId]);

  const fetchOrders = React.useCallback(
    async (override?: Filters) => {
      if (!workspaceId) {
        setOrders([]);
        return;
      }

      setListLoading(true);
      try {
        const query = buildFilters(override ?? filters);
        const data = await listWorkOrders(workspaceId, query);
        setOrders(data);
      } catch (err) {
        message.error("Failed to load work orders.");
      } finally {
        setListLoading(false);
      }
    },
    [workspaceId, filters]
  );

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setInitialLoading(true);
      await Promise.all([fetchStatuses(), fetchOrders(), fetchOverview()]);
      if (mounted) setInitialLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [fetchOrders, fetchOverview, fetchStatuses]);

  const handleApplyFilters = () => {
    fetchOrders();
  };

  const handleResetFilters = () => {
    setFilters({});
    fetchOrders({});
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
        message.success("Work order updated");
      } else {
        const created = await createWorkOrder(workspaceId, {
          ...(payload as CreateWorkOrderInput),
          workspaceId,
          createdBy: (payload as CreateWorkOrderInput).createdBy ?? currentUserUid ?? undefined,
          requesterUserUid: (payload as CreateWorkOrderInput).requesterUserUid ?? undefined,
        });
        setSelected(created ?? null);
        message.success("Work order created");
      }

      await Promise.all([fetchOrders(), fetchOverview()]);
    } catch (err) {
      message.error("Failed to save work order.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (order: WorkOrder) => {
    if (!workspaceId) return;

    Modal.confirm({
      title: `Delete work order "${order.title}"?`,
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteWorkOrder(workspaceId, order.id);
          if (selected?.id === order.id) setSelected(null);
          await Promise.all([fetchOrders(), fetchOverview()]);
          message.success("Work order deleted");
        } catch (err) {
          message.error("Failed to delete work order.");
        }
      },
    });
  };

  if (initialLoading) {
    return <PageSkeleton mainRows={5} sideRows={5} height="100%" />;
  }

  return (
    <WorkOrdersTemplate
      list={
        <WorkOrderList
          orders={orders}
          statuses={statuses}
          loading={listLoading}
          selectedId={selected?.id ?? null}
          filters={filters}
          overview={overview}
          onChangeFilters={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
          onApplyFilters={handleApplyFilters}
          onApplyFilterPatch={(patch) => {
            const next = { ...filters, ...patch };
            setFilters(next);
            fetchOrders(next);
          }}
          onResetFilters={handleResetFilters}
          onSelect={(order) => setSelected(order)}
          onCreate={() => setSelected(null)}
          onDelete={handleDelete}
          onRefresh={() => fetchOrders()}
        />
      }
      editor={
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
          onCancel={() => setSelected(null)}
        />
      }
    />
  );
}

export class WorkOrdersPage extends BasePage {
  protected override options = {
    title: "Work orders | WorklyHub",
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <WorkOrdersPageContent />;
  }
}

export default WorkOrdersPage;
