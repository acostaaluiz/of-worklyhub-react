import React from "react";
import { Button, Input, Select, Space, Table, Tag, Popconfirm } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

import type {
  WorkOrder,
  WorkOrderPriority,
  WorkOrderStatus,
} from "@modules/work-order/interfaces/work-order.model";
import { formatMoneyFromCents } from "@core/utils/mask";

type Filters = {
  search?: string;
  statusId?: string;
  priority?: WorkOrderPriority;
};

type Props = {
  orders: WorkOrder[];
  statuses: WorkOrderStatus[];
  loading?: boolean;
  selectedId?: string | null;
  filters: Filters;
  onChangeFilters: (patch: Partial<Filters>) => void;
  onApplyFilters: () => void;
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

function getStatusColor(status?: WorkOrderStatus | null) {
  if (!status) return "default";
  return statusColorMap[status.code] ?? "default";
}

export function WorkOrderList({
  orders,
  statuses,
  loading,
  selectedId,
  filters,
  onChangeFilters,
  onApplyFilters,
  onResetFilters,
  onSelect,
  onCreate,
  onDelete,
  onRefresh,
}: Props) {
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

  return (
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
}

export default WorkOrderList;
