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
import { i18n as appI18n } from "@core/i18n";
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
        const priorityLabel = React.useCallback(
    (priority: WorkOrderPriority) => {
      if (priority === "low") return appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k001");
      if (priority === "medium") return appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k002");
      if (priority === "high") return appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k003");
      if (priority === "urgent") return appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k004");
      return priority;
    },
    []
  );

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
          {appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k005")}
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
          {appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k006")}
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
            {appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k007")}
          </Space>
        ),
        dataIndex: "priority",
        key: "priority",
        width: 90,
        render: (priority: WorkOrderPriority) => (
          <Tag color={priorityColors[priority] ?? "default"}>
            {priorityLabel(priority)}
          </Tag>
        ),
      },
      {
        title: (
          <Space size={6}>
            <CalendarOutlined />
            {appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k008")}
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
            {appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k009")}
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
            {appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k010")}
          </Space>
        ),
        key: "actions",
        width: 160,
        className: "work-order-actions-col",
        render: (_, record) => (
          <Space>
            <Button size="small" icon={<EditOutlined />} onClick={() => onSelect(record)}>
              {appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k011")}
            </Button>
            <Popconfirm
              title={appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k012")}
              okText={appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k013")}
              okButtonProps={{ danger: true }}
              onConfirm={() => onDelete(record)}
            >
              <Button size="small" danger icon={<DeleteOutlined />}>
                {appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k014")}
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ];
  }, [isMobileViewport, onDelete, onSelect, priorityLabel]);

  const workOrdersContent = (
    <WorkOrdersPane data-cy="work-order-list-pane">
      <PaneToolbar>
        <PaneHeader>
          <PaneTitle>{appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k015")}</PaneTitle>
          <PaneActions>
            <Button icon={<ReloadOutlined />} onClick={onRefresh}>
              {appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k016")}
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onCreate}
              data-cy="work-order-new-button"
            >
              {appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k017")}
            </Button>
          </PaneActions>
        </PaneHeader>

        <FiltersRow>
          <Input
            placeholder={appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k018")}
            value={filters.search}
            allowClear
            onChange={(e) => onChangeFilters({ search: e.target.value })}
            onPressEnter={onApplyFilters}
            style={{ width: isMobileViewport ? "100%" : 200 }}
          />
          <Select
            placeholder={appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k019")}
            value={filters.riskLevel || undefined}
            allowClear
            style={{ width: isMobileViewport ? "100%" : 190 }}
            options={[
              { value: "overdue", label: appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k020") },
              { value: "due_soon", label: appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k021") },
              { value: "checklist_at_risk", label: appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k022") },
              { value: "high_priority", label: appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k023") },
              { value: "unscheduled", label: appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k024") },
            ]}
            onChange={(value) => onChangeFilters({ riskLevel: value as WorkOrderRiskLevel })}
          />
          <Select
            placeholder={appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k025")}
            value={filters.statusId || undefined}
            allowClear
            style={{ width: isMobileViewport ? "100%" : 180 }}
            options={statuses.map((s) => ({ value: s.id, label: s.label }))}
            onChange={(value) => onChangeFilters({ statusId: value })}
          />
          <Select
            placeholder={appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k026")}
            value={filters.priority || undefined}
            allowClear
            style={{ width: isMobileViewport ? "100%" : 140 }}
            options={[
              { value: "low", label: appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k027") },
              { value: "medium", label: appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k028") },
              { value: "high", label: appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k029") },
              { value: "urgent", label: appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k030") },
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
            {appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k031")}
          </Button>
          <Button
            icon={<UndoOutlined />}
            onClick={onResetFilters}
            style={isMobileViewport ? { flex: "1 1 calc(50% - 4px)" } : undefined}
          >
            {appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k032")}
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
          scroll={{ y: isMobileViewport ? 320 : 340, x: isMobileViewport ? undefined : 840 }}
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
              <span>{appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k033")}</span>
            </>
          ) : hasMore ? (
            <span>{appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k034")}</span>
          ) : (
            <span>{appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k035")}</span>
          )}
        </TableFooterState>
      </TableWrap>
    </WorkOrdersPane>
  );

  const operationsOverviewContent = overview ? (
    <OverviewCard>
      <OverviewHeader>
        <OverviewTitle>{appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k036")}</OverviewTitle>
        <OverviewUpdated>
          {appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k037")} {formatAppDateTime(overview.generatedAt, "--")}
        </OverviewUpdated>
      </OverviewHeader>

      <OverviewTags>
        <Tag color="geekblue">{appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k038")}: {overview.totals.active}</Tag>
        <Tag color="green">{appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k039")}: {overview.totals.terminal}</Tag>
        <Tag color={overview.totals.overdue > 0 ? "red" : "default"}>
          {appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k040")}: {overview.totals.overdue}
        </Tag>
        <Tag color={overview.totals.dueSoon > 0 ? "orange" : "default"}>
          {appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k041")}: {overview.totals.dueSoon}
        </Tag>
        <Tag color={overview.totals.highPriorityOpen > 0 ? "volcano" : "default"}>
          {appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k042")}: {overview.totals.highPriorityOpen}
        </Tag>
        <Tag color={overview.totals.unscheduled > 0 ? "gold" : "default"}>
          {appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k043")}: {overview.totals.unscheduled}
        </Tag>
        <Tag color={overview.totals.checklistAtRisk > 0 ? "red" : "default"}>
          {appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k044")}: {overview.totals.checklistAtRisk}
        </Tag>
        <Tag>{appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k045")}: {overview.performance.completionRate.toFixed(1)}%</Tag>
        <Tag>{appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k046")}: {overview.performance.avgResolutionHours.toFixed(1)}h</Tag>
      </OverviewTags>

      <OverviewActions>
        <Button size="small" icon={<EyeOutlined />} onClick={() => applyRiskFilter("overdue")}>
          {appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k047")}
        </Button>
        <Button size="small" icon={<EyeOutlined />} onClick={() => applyRiskFilter("due_soon")}>
          {appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k048")}
        </Button>
        <Button size="small" icon={<EyeOutlined />} onClick={() => applyRiskFilter("checklist_at_risk")}>
          {appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k049")}
        </Button>
        <Button size="small" icon={<EyeOutlined />} onClick={() => applyRiskFilter("high_priority")}>
          {appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k050")}
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
      {appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k051")}
    </OverviewEmpty>
  );

  return (
    <ListRoot data-cy="work-order-list">
      <StyledTabs
        data-cy="work-order-list-tabs"
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
                {appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k052")}
              </Space>
            ),
            children: workOrdersContent,
          },
          {
            key: "operations-overview",
            label: (
              <Space size={6}>
                <BarChartOutlined />
                {appI18n.t("legacyInline.work_order.presentation_components_work_order_list_work_order_list_component.k053")}
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
