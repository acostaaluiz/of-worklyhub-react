import React from "react";
import { Button, Input, Select, Space, Table, Tag, Popconfirm, Tabs } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

import type {
  WorkOrder,
  WorkOrderPriority,
  WorkOrderOverview,
  WorkOrderRiskLevel,
  WorkOrderStatus,
} from "@modules/work-order/interfaces/work-order.model";
import { formatMoneyFromCents } from "@core/utils/mask";

type Filters = {
  search?: string;
  riskLevel?: WorkOrderRiskLevel;
  statusId?: string;
  priority?: WorkOrderPriority;
};

type Props = {
  orders: WorkOrder[];
  statuses: WorkOrderStatus[];
  overview?: WorkOrderOverview | null;
  loading?: boolean;
  selectedId?: string | null;
  filters: Filters;
  onChangeFilters: (patch: Partial<Filters>) => void;
  onApplyFilters: () => void;
  onApplyFilterPatch?: (patch: Partial<Filters>) => void;
  onResetFilters: () => void;
  onSelect: (order: WorkOrder) => void;
  onCreate: () => void;
  onDelete: (order: WorkOrder) => void;
  onRefresh: () => void;
};

const priorityColors: Record<WorkOrderPriority, string> = {
  low: "default",
  medium: "blue",
  high: "orange",
  urgent: "red",
};

const statusColorMap: Record<string, string> = {
  opened: "gold",
  work_in_progress: "blue",
  completed: "green",
  canceled: "red",
};

const insightSeverityColor: Record<string, string> = {
  high: "red",
  medium: "orange",
  low: "blue",
};

function getStatusColor(status?: WorkOrderStatus | null) {
  if (!status) return "default";
  return statusColorMap[status.code] ?? "default";
}

export function WorkOrderList({
  orders,
  statuses,
  overview,
  loading,
  selectedId,
  filters,
  onChangeFilters,
  onApplyFilters,
  onApplyFilterPatch,
  onResetFilters,
  onSelect,
  onCreate,
  onDelete,
  onRefresh,
}: Props) {
  const [activeTab, setActiveTab] = React.useState<"work-orders" | "operations-overview">(
    "work-orders"
  );

  const applyRiskFilter = React.useCallback(
    (riskLevel: WorkOrderRiskLevel) => {
      setActiveTab("work-orders");
      if (onApplyFilterPatch) {
        onApplyFilterPatch({ riskLevel });
        return;
      }
      onChangeFilters({ riskLevel });
      onApplyFilters();
    },
    [onApplyFilterPatch, onChangeFilters, onApplyFilters]
  );

  const columns = React.useMemo<ColumnsType<WorkOrder>>(
    () => [
      {
        title: "Title",
        dataIndex: "title",
        key: "title",
        width: 220,
        render: (_, record) => (
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <span style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {record.title}
            </span>
            {record.description ? (
              <span style={{ color: "var(--color-text-muted)", fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {record.description}
              </span>
            ) : null}
          </div>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 110,
        render: (status?: WorkOrderStatus) => (
          <Tag color={getStatusColor(status)}>{status?.label ?? "--"}</Tag>
        ),
      },
      {
        title: "Priority",
        dataIndex: "priority",
        key: "priority",
        width: 90,
        render: (priority: WorkOrderPriority) => (
          <Tag color={priorityColors[priority] ?? "default"}>
            {priority}
          </Tag>
        ),
      },
      {
        title: "Due",
        dataIndex: "dueAt",
        key: "dueAt",
        width: 90,
        render: (value?: string | null, record?: WorkOrder) => {
          const date = value || record?.scheduledEndAt || record?.scheduledStartAt;
          if (!date) return "--";
          return dayjs(date).format("MMM D");
        },
      },
      {
        title: "Total",
        dataIndex: "totalEstimatedCents",
        key: "totalEstimatedCents",
        width: 100,
        render: (value?: number) =>
          typeof value === "number" ? formatMoneyFromCents(value) : "--",
      },
      {
        title: "Actions",
        key: "actions",
        width: 110,
        render: (_, record) => (
          <Space>
            <Button size="small" onClick={() => onSelect(record)}>
              Edit
            </Button>
            <Popconfirm
              title="Delete work order?"
              okText="Delete"
              okButtonProps={{ danger: true }}
              onConfirm={() => onDelete(record)}
            >
              <Button size="small" danger>
                Delete
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [onDelete, onSelect]
  );

  const workOrdersContent = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontWeight: 600, fontSize: 16 }}>Work orders</div>
          <Space>
            <Button onClick={onRefresh}>Refresh</Button>
            <Button type="primary" onClick={onCreate}>
              New work order
            </Button>
          </Space>
        </div>

        <Space wrap>
          <Input
            placeholder="Search"
            value={filters.search}
            allowClear
            onChange={(e) => onChangeFilters({ search: e.target.value })}
            onPressEnter={onApplyFilters}
            style={{ width: 200 }}
          />
          <Select
            placeholder="Risk"
            value={filters.riskLevel || undefined}
            allowClear
            style={{ width: 190 }}
            options={[
              { value: "overdue", label: "Overdue" },
              { value: "due_soon", label: "Due soon (24h)" },
              { value: "checklist_at_risk", label: "Checklist at risk" },
              { value: "high_priority", label: "High priority open" },
              { value: "unscheduled", label: "Unscheduled" },
            ]}
            onChange={(value) => onChangeFilters({ riskLevel: value as WorkOrderRiskLevel })}
          />
          <Select
            placeholder="Status"
            value={filters.statusId || undefined}
            allowClear
            style={{ width: 180 }}
            options={statuses.map((s) => ({ value: s.id, label: s.label }))}
            onChange={(value) => onChangeFilters({ statusId: value })}
          />
          <Select
            placeholder="Priority"
            value={filters.priority || undefined}
            allowClear
            style={{ width: 140 }}
            options={[
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
              { value: "urgent", label: "Urgent" },
            ]}
            onChange={(value) => onChangeFilters({ priority: value as WorkOrderPriority })}
          />
          <Button type="primary" onClick={onApplyFilters}>
            Apply
          </Button>
          <Button onClick={onResetFilters}>Reset</Button>
        </Space>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <Table
          columns={columns}
          dataSource={orders}
          loading={loading}
          rowKey={(record) => record.id}
          pagination={{ pageSize: 6, size: "small" }}
          scroll={{ y: 340, x: 720 }}
          onRow={(record) => ({
            onClick: () => onSelect(record),
            style:
              selectedId && record.id === selectedId
                ? { background: "var(--color-surface-2)" }
                : undefined,
          })}
        />
      </div>
    </div>
  );

  const operationsOverviewContent = overview ? (
    <div
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: 10,
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        background: "var(--color-surface-2)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontWeight: 600 }}>Operations overview</div>
        <div style={{ color: "var(--color-text-muted)", fontSize: 12 }}>
          Updated {dayjs(overview.generatedAt).format("MMM D, HH:mm")}
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <Tag color="geekblue">Open: {overview.totals.active}</Tag>
        <Tag color="green">Completed: {overview.totals.terminal}</Tag>
        <Tag color={overview.totals.overdue > 0 ? "red" : "default"}>
          Overdue: {overview.totals.overdue}
        </Tag>
        <Tag color={overview.totals.dueSoon > 0 ? "orange" : "default"}>
          Due soon: {overview.totals.dueSoon}
        </Tag>
        <Tag color={overview.totals.highPriorityOpen > 0 ? "volcano" : "default"}>
          High priority open: {overview.totals.highPriorityOpen}
        </Tag>
        <Tag color={overview.totals.unscheduled > 0 ? "gold" : "default"}>
          Unscheduled: {overview.totals.unscheduled}
        </Tag>
        <Tag color={overview.totals.checklistAtRisk > 0 ? "red" : "default"}>
          Checklist at risk: {overview.totals.checklistAtRisk}
        </Tag>
        <Tag>Completion: {overview.performance.completionRate.toFixed(1)}%</Tag>
        <Tag>Avg resolution: {overview.performance.avgResolutionHours.toFixed(1)}h</Tag>
      </div>

      <Space wrap>
        <Button size="small" onClick={() => applyRiskFilter("overdue")}>
          View overdue
        </Button>
        <Button size="small" onClick={() => applyRiskFilter("due_soon")}>
          View due soon
        </Button>
        <Button size="small" onClick={() => applyRiskFilter("checklist_at_risk")}>
          Checklist at risk
        </Button>
        <Button size="small" onClick={() => applyRiskFilter("high_priority")}>
          High priority
        </Button>
      </Space>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {(overview.insights ?? []).map((insight) => (
          <div
            key={insight.code}
            style={{ display: "flex", gap: 8, alignItems: "flex-start" }}
          >
            <Tag color={insightSeverityColor[insight.severity] ?? "default"}>
              {insight.severity.toUpperCase()}
            </Tag>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontWeight: 600 }}>{insight.title}</span>
              <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                {insight.description}
              </span>
              <span style={{ fontSize: 12 }}>{insight.suggestedAction}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : (
    <div style={{ color: "var(--color-text-muted)" }}>
      Operations overview is loading or unavailable for this workspace.
    </div>
  );

  return (
    <div style={{ height: "100%" }}>
      <Tabs
        activeKey={activeTab}
        onChange={(key) =>
          setActiveTab(key as "work-orders" | "operations-overview")
        }
        items={[
          {
            key: "work-orders",
            label: "Work orders",
            children: workOrdersContent,
          },
          {
            key: "operations-overview",
            label: "Operations overview",
            children: operationsOverviewContent,
          },
        ]}
      />
    </div>
  );
}

export default WorkOrderList;
