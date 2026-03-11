import React from "react";
import { Button, DatePicker, Input, Popconfirm, Select, Space, Spin, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import {
  AppstoreOutlined,
  BarChartOutlined,
  CalendarOutlined,
  DeleteOutlined,
  DollarCircleOutlined,
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
  FilterOutlined,
  FlagOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  ToolOutlined,
  UndoOutlined,
} from "@ant-design/icons";

import type {
  WorkOrder,
  WorkOrderPriority,
  WorkOrderOverview,
  WorkOrderRiskLevel,
  WorkOrderStatus,
} from "@modules/work-order/interfaces/work-order.model";
import { formatMoneyFromCents } from "@core/utils/mask";
import { formatAppDateTime } from "@core/utils/date-time";
import {
  FiltersRow,
  InsightAction,
  InsightDescription,
  InsightMeta,
  InsightRow,
  InsightTitle,
  InsightsList,
  ListRoot,
  OverviewActions,
  OverviewCard,
  OverviewEmpty,
  OverviewHeader,
  OverviewTags,
  OverviewTitle,
  OverviewUpdated,
  PaneActions,
  PaneHeader,
  PaneTitle,
  PaneToolbar,
  StyledTabs,
  TableWrap,
  TableFooterState,
  WorkOrdersPane,
} from "./work-order-list.component.styles";

type Filters = {
  search?: string;
  riskLevel?: WorkOrderRiskLevel;
  statusId?: string;
  priority?: WorkOrderPriority;
  dateFrom?: string;
  dateTo?: string;
};

type Props = {
  orders: WorkOrder[];
  statuses: WorkOrderStatus[];
  overview?: WorkOrderOverview | null;
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  selectedId?: string | null;
  filters: Filters;
  onChangeFilters: (patch: Partial<Filters>) => void;
  onApplyFilters: () => void;
  onApplyFilterPatch?: (patch: Partial<Filters>) => void;
  onResetFilters: () => void;
  onLoadMore: () => void;
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
  loadingMore,
  hasMore,
  selectedId,
  filters,
  onChangeFilters,
  onApplyFilters,
  onApplyFilterPatch,
  onResetFilters,
  onLoadMore,
  onSelect,
  onCreate,
  onDelete,
  onRefresh,
}: Props) {
  const isMobileViewport =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 768px)").matches;

  const [activeTab, setActiveTab] = React.useState<"work-orders" | "operations-overview">(
    "work-orders"
  );
  const tableWrapRef = React.useRef<HTMLDivElement | null>(null);

  const dateRangeValue = React.useMemo<[Dayjs | null, Dayjs | null] | null>(() => {
    if (!filters.dateFrom && !filters.dateTo) return null;
    const start = filters.dateFrom ? dayjs(filters.dateFrom) : null;
    const end = filters.dateTo ? dayjs(filters.dateTo) : null;
    return [start, end];
  }, [filters.dateFrom, filters.dateTo]);

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

  const handleLoadMore = React.useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    onLoadMore();
  }, [loading, loadingMore, hasMore, onLoadMore]);

  React.useEffect(() => {
    const host = tableWrapRef.current;
    if (!host) return;
    const body = host.querySelector(".ant-table-body");
    if (!body) return;

    const onScroll = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const threshold = 72;
      const reachedBottom =
        target.scrollTop + target.clientHeight >= target.scrollHeight - threshold;
      if (reachedBottom) handleLoadMore();
    };

    body.addEventListener("scroll", onScroll, { passive: true });
    return () => body.removeEventListener("scroll", onScroll);
  }, [handleLoadMore, orders.length]);

  const columns = React.useMemo<ColumnsType<WorkOrder>>(() => {
    const titleColumn: ColumnsType<WorkOrder>[number] = {
      title: (
        <Space size={6}>
          <FileTextOutlined />
          Title
        </Space>
      ),
      dataIndex: "title",
      key: "title",
      width: isMobileViewport ? undefined : 220,
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
    };

    const statusColumn: ColumnsType<WorkOrder>[number] = {
      title: (
        <Space size={6}>
          <InfoCircleOutlined />
          Status
        </Space>
      ),
      dataIndex: "status",
      key: "status",
      width: isMobileViewport ? 126 : 110,
      render: (status?: WorkOrderStatus) => (
        <Tag color={getStatusColor(status)}>{status?.label ?? "--"}</Tag>
      ),
    };

    if (isMobileViewport) {
      return [titleColumn, statusColumn];
    }

    return [
      titleColumn,
      statusColumn,
      {
        title: (
          <Space size={6}>
            <FlagOutlined />
            Priority
          </Space>
        ),
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
        title: (
          <Space size={6}>
            <CalendarOutlined />
            Due
          </Space>
        ),
        dataIndex: "dueAt",
        key: "dueAt",
        width: 90,
        render: (value?: string | null, record?: WorkOrder) => {
          const date = value || record?.scheduledEndAt || record?.scheduledStartAt;
          if (!date) return "--";
          return formatAppDateTime(date, "--");
        },
      },
      {
        title: (
          <Space size={6}>
            <DollarCircleOutlined />
            Total
          </Space>
        ),
        dataIndex: "totalEstimatedCents",
        key: "totalEstimatedCents",
        width: 100,
        render: (value?: number) =>
          typeof value === "number" ? formatMoneyFromCents(value) : "--",
      },
      {
        title: (
          <Space size={6}>
            <ToolOutlined />
            Actions
          </Space>
        ),
        key: "actions",
        width: 110,
        render: (_, record) => (
          <Space>
            <Button size="small" icon={<EditOutlined />} onClick={() => onSelect(record)}>
              Edit
            </Button>
            <Popconfirm
              title="Delete work order?"
              okText="Delete"
              okButtonProps={{ danger: true }}
              onConfirm={() => onDelete(record)}
            >
              <Button size="small" danger icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ];
  }, [isMobileViewport, onDelete, onSelect]);

  const workOrdersContent = (
    <WorkOrdersPane>
      <PaneToolbar>
        <PaneHeader>
          <PaneTitle>Work orders</PaneTitle>
          <PaneActions>
            <Button icon={<ReloadOutlined />} onClick={onRefresh}>
              Refresh
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
              New work order
            </Button>
          </PaneActions>
        </PaneHeader>

        <FiltersRow>
          <Input
            placeholder="Search"
            value={filters.search}
            allowClear
            onChange={(e) => onChangeFilters({ search: e.target.value })}
            onPressEnter={onApplyFilters}
            style={{ width: isMobileViewport ? "100%" : 200 }}
          />
          <Select
            placeholder="Risk"
            value={filters.riskLevel || undefined}
            allowClear
            style={{ width: isMobileViewport ? "100%" : 190 }}
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
            style={{ width: isMobileViewport ? "100%" : 180 }}
            options={statuses.map((s) => ({ value: s.id, label: s.label }))}
            onChange={(value) => onChangeFilters({ statusId: value })}
          />
          <Select
            placeholder="Priority"
            value={filters.priority || undefined}
            allowClear
            style={{ width: isMobileViewport ? "100%" : 140 }}
            options={[
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
              { value: "urgent", label: "Urgent" },
            ]}
            onChange={(value) => onChangeFilters({ priority: value as WorkOrderPriority })}
          />
          <DatePicker.RangePicker
            value={dateRangeValue}
            format="YYYY-MM-DD"
            allowEmpty={[true, true]}
            style={isMobileViewport ? { width: "100%" } : undefined}
            onChange={(value) => {
              onChangeFilters({
                dateFrom: value?.[0]?.format("YYYY-MM-DD"),
                dateTo: value?.[1]?.format("YYYY-MM-DD"),
              });
            }}
          />
          <Button
            type="primary"
            icon={<FilterOutlined />}
            onClick={onApplyFilters}
            style={isMobileViewport ? { flex: "1 1 calc(50% - 4px)" } : undefined}
          >
            Apply
          </Button>
          <Button
            icon={<UndoOutlined />}
            onClick={onResetFilters}
            style={isMobileViewport ? { flex: "1 1 calc(50% - 4px)" } : undefined}
          >
            Reset
          </Button>
        </FiltersRow>
      </PaneToolbar>

      <TableWrap ref={tableWrapRef}>
        <Table
          columns={columns}
          dataSource={orders}
          loading={loading}
          rowKey={(record) => record.id}
          pagination={false}
          size={isMobileViewport ? "small" : "middle"}
          scroll={{ y: isMobileViewport ? 320 : 340, x: isMobileViewport ? undefined : 720 }}
          onRow={(record) => ({
            onClick: () => onSelect(record),
            style:
              selectedId && record.id === selectedId
                ? { background: "var(--color-surface-2)" }
                : undefined,
          })}
        />
        <TableFooterState>
          {loadingMore ? (
            <>
              <Spin size="small" />
              <span>Loading more work orders...</span>
            </>
          ) : hasMore ? (
            <span>Scroll down to load more.</span>
          ) : (
            <span>End of results.</span>
          )}
        </TableFooterState>
      </TableWrap>
    </WorkOrdersPane>
  );

  const operationsOverviewContent = overview ? (
    <OverviewCard>
      <OverviewHeader>
        <OverviewTitle>Operations overview</OverviewTitle>
        <OverviewUpdated>Updated {formatAppDateTime(overview.generatedAt, "--")}</OverviewUpdated>
      </OverviewHeader>

      <OverviewTags>
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
      </OverviewTags>

      <OverviewActions>
        <Button size="small" icon={<EyeOutlined />} onClick={() => applyRiskFilter("overdue")}>
          View overdue
        </Button>
        <Button size="small" icon={<EyeOutlined />} onClick={() => applyRiskFilter("due_soon")}>
          View due soon
        </Button>
        <Button size="small" icon={<EyeOutlined />} onClick={() => applyRiskFilter("checklist_at_risk")}>
          Checklist at risk
        </Button>
        <Button size="small" icon={<EyeOutlined />} onClick={() => applyRiskFilter("high_priority")}>
          High priority
        </Button>
      </OverviewActions>

      <InsightsList>
        {(overview.insights ?? []).map((insight) => (
          <InsightRow key={insight.code}>
            <Tag color={insightSeverityColor[insight.severity] ?? "default"}>
              {insight.severity.toUpperCase()}
            </Tag>
            <InsightMeta>
              <InsightTitle>{insight.title}</InsightTitle>
              <InsightDescription>{insight.description}</InsightDescription>
              <InsightAction>{insight.suggestedAction}</InsightAction>
            </InsightMeta>
          </InsightRow>
        ))}
      </InsightsList>
    </OverviewCard>
  ) : (
    <OverviewEmpty>
      Operations overview is loading or unavailable for this workspace.
    </OverviewEmpty>
  );

  return (
    <ListRoot>
      <StyledTabs
        activeKey={activeTab}
        onChange={(key) =>
          setActiveTab(key as "work-orders" | "operations-overview")
        }
        items={[
          {
            key: "work-orders",
            label: (
              <Space size={6}>
                <AppstoreOutlined />
                Work orders
              </Space>
            ),
            children: workOrdersContent,
          },
          {
            key: "operations-overview",
            label: (
              <Space size={6}>
                <BarChartOutlined />
                Operations overview
              </Space>
            ),
            children: operationsOverviewContent,
          },
        ]}
      />
    </ListRoot>
  );
}

export default WorkOrderList;
