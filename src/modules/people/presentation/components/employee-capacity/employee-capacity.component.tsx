import React from "react";
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  TimePicker,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs, { type Dayjs } from "dayjs";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  StopOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import type { EmployeeModel } from "@modules/people/interfaces/employee.model";
import type {
  CreateEmployeeAvailabilityBlockInput,
  EmployeeAvailabilityBlock,
  EmployeeCapacityRow,
  UpsertEmployeeWeeklyAvailabilityInput,
  WeeklyAvailabilityMinutes,
  WorkforceCapacitySnapshot,
} from "@modules/people/interfaces/workforce-capacity.model";
import { getWeekStartDate } from "@modules/people/services/workforce-capacity.service";

type Props = {
  employees: EmployeeModel[];
  weekStart: string;
  snapshot: WorkforceCapacitySnapshot | null;
  loading?: boolean;
  onChangeWeek: (weekStart: string) => void;
  onRefresh: () => void;
  onSaveAvailability: (input: UpsertEmployeeWeeklyAvailabilityInput) => Promise<void> | void;
  onCreateBlock: (input: CreateEmployeeAvailabilityBlockInput) => Promise<void> | void;
  onDeleteBlock: (blockId: string) => Promise<void> | void;
};

type BlockFormValues = {
  employeeId?: string;
  date?: Dayjs;
  timeRange?: [Dayjs, Dayjs];
  reason?: string;
};

const weekdayEditorFields: Array<{ key: string; label: string }> = [
  { key: "1", label: "Monday" },
  { key: "2", label: "Tuesday" },
  { key: "3", label: "Wednesday" },
  { key: "4", label: "Thursday" },
  { key: "5", label: "Friday" },
  { key: "6", label: "Saturday" },
  { key: "0", label: "Sunday" },
];

function toHours(minutes: number): number {
  return Math.round((minutes / 60) * 10) / 10;
}

function formatHours(minutes: number): string {
  return `${toHours(minutes).toFixed(1)} h`;
}

function getUtilizationColor(value: number): string {
  if (value >= 100) return "red";
  if (value >= 85) return "orange";
  return "green";
}

function timeToMinutes(value: string): number {
  const match = /^(\d{2}):(\d{2})$/.exec(value.trim());
  if (!match) return 0;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return 0;
  return Math.max(0, Math.min(23, hours)) * 60 + Math.max(0, Math.min(59, minutes));
}

function getEmployeeNameMap(employees: EmployeeModel[]): Map<string, string> {
  const out = new Map<string, string>();
  for (const employee of employees) {
    const name = `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim();
    out.set(employee.id, name || employee.email || employee.id);
  }
  return out;
}

export function EmployeeCapacityComponent({
  employees,
  weekStart,
  snapshot,
  loading,
  onChangeWeek,
  onRefresh,
  onSaveAvailability,
  onCreateBlock,
  onDeleteBlock,
}: Props) {
  const [availabilityModalOpen, setAvailabilityModalOpen] = React.useState(false);
  const [selectedAvailabilityEmployee, setSelectedAvailabilityEmployee] = React.useState<EmployeeCapacityRow | null>(null);
  const [availabilityDraftHours, setAvailabilityDraftHours] = React.useState<WeeklyAvailabilityMinutes>({});
  const [savingAvailability, setSavingAvailability] = React.useState(false);

  const [blockModalOpen, setBlockModalOpen] = React.useState(false);
  const [savingBlock, setSavingBlock] = React.useState(false);
  const [deletingBlockId, setDeletingBlockId] = React.useState<string | null>(null);
  const [blockForm] = Form.useForm<BlockFormValues>();

  const rows = snapshot?.rows ?? [];
  const blocks = snapshot?.blocks ?? [];
  const employeeNameMap = React.useMemo(() => getEmployeeNameMap(employees), [employees]);
  const activeEmployeeOptions = React.useMemo(
    () =>
      employees
        .filter((employee) => employee.active)
        .map((employee) => ({
          value: employee.id,
          label: employeeNameMap.get(employee.id) ?? employee.id,
        }))
        .sort((left, right) => left.label.localeCompare(right.label)),
    [employeeNameMap, employees]
  );

  const openAvailabilityModal = (row: EmployeeCapacityRow) => {
    setSelectedAvailabilityEmployee(row);
    const hoursByWeekday: WeeklyAvailabilityMinutes = {};
    for (const [weekday, minutes] of Object.entries(row.weeklyAvailabilityMinutesByWeekday ?? {})) {
      hoursByWeekday[weekday] = toHours(Number(minutes) || 0);
    }
    setAvailabilityDraftHours(hoursByWeekday);
    setAvailabilityModalOpen(true);
  };

  const handleSaveAvailability = async () => {
    if (!selectedAvailabilityEmployee) return;

    const minutesByWeekday: WeeklyAvailabilityMinutes = {};
    for (const day of weekdayEditorFields) {
      const hours = Number(availabilityDraftHours[day.key] ?? 0);
      const safeHours = Number.isFinite(hours) && hours > 0 ? hours : 0;
      minutesByWeekday[day.key] = Math.round(safeHours * 60);
    }

    setSavingAvailability(true);
    try {
      await onSaveAvailability({
        employeeId: selectedAvailabilityEmployee.employeeId,
        minutesByWeekday,
      });
      setAvailabilityModalOpen(false);
      setSelectedAvailabilityEmployee(null);
    } finally {
      setSavingAvailability(false);
    }
  };

  const openBlockModal = () => {
    const defaultEmployeeId = activeEmployeeOptions[0]?.value;
    const defaultDate = dayjs(weekStart);
    blockForm.setFieldsValue({
      employeeId: defaultEmployeeId,
      date: defaultDate,
      timeRange: [dayjs("09:00", "HH:mm"), dayjs("10:00", "HH:mm")],
      reason: "",
    });
    setBlockModalOpen(true);
  };

  const handleCreateBlock = async () => {
    const values = await blockForm.validateFields();
    const employeeId = values.employeeId?.trim();
    const date = values.date;
    const timeRange = values.timeRange;
    const reason = values.reason?.trim();

    if (!employeeId || !date || !timeRange || timeRange.length !== 2) return;

    setSavingBlock(true);
    try {
      await onCreateBlock({
        employeeId,
        date: date.format("YYYY-MM-DD"),
        startTime: timeRange[0].format("HH:mm"),
        endTime: timeRange[1].format("HH:mm"),
        reason: reason || undefined,
      });
      setBlockModalOpen(false);
      blockForm.resetFields();
    } finally {
      setSavingBlock(false);
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    setDeletingBlockId(blockId);
    try {
      await onDeleteBlock(blockId);
    } finally {
      setDeletingBlockId(null);
    }
  };

  const capacityColumns: ColumnsType<EmployeeCapacityRow> = [
    {
      title: "Collaborator",
      dataIndex: "employeeName",
      key: "employeeName",
      render: (_value, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{record.employeeName}</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {record.conflictDays > 0
              ? `${record.conflictDays} conflict day(s) this week`
              : "No conflict in the selected week"}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: "Availability",
      key: "availability",
      width: 130,
      render: (_value, record) => formatHours(record.totalAvailabilityMinutes),
    },
    {
      title: "Load",
      key: "load",
      width: 230,
      render: (_value, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text>{formatHours(record.totalPlannedMinutes)}</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Schedule {formatHours(record.totalScheduledMinutes)} | WO {formatHours(record.totalWorkOrderMinutes)}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: "Productive",
      key: "productive",
      width: 130,
      render: (_value, record) => formatHours(record.totalProductiveMinutes),
    },
    {
      title: "Utilization",
      key: "utilization",
      width: 120,
      render: (_value, record) => (
        <Tag color={getUtilizationColor(record.utilizationPercent)}>
          {record.utilizationPercent.toFixed(1)}%
        </Tag>
      ),
    },
    {
      title: "Overload",
      key: "overload",
      width: 140,
      render: (_value, record) =>
        record.totalOverloadMinutes > 0 ? (
          <Tag color="red">+{formatHours(record.totalOverloadMinutes)}</Tag>
        ) : (
          <Tag color="green">None</Tag>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 130,
      render: (_value, record) => (
        <Button size="small" icon={<EditOutlined />} onClick={() => openAvailabilityModal(record)}>
          Availability
        </Button>
      ),
    },
  ];

  const blockColumns: ColumnsType<EmployeeAvailabilityBlock> = [
    {
      title: "Collaborator",
      dataIndex: "employeeId",
      key: "employeeId",
      render: (employeeId: string) => employeeNameMap.get(employeeId) ?? employeeId,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 120,
    },
    {
      title: "Time",
      key: "time",
      width: 180,
      render: (_value, record) => `${record.startTime} - ${record.endTime}`,
    },
    {
      title: "Duration",
      key: "duration",
      width: 100,
      render: (_value, record) => {
        const start = timeToMinutes(record.startTime);
        const end = timeToMinutes(record.endTime);
        return `${Math.max(0, end - start)} min`;
      },
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      render: (reason?: string) => reason || "--",
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_value, record) => (
        <Popconfirm
          title="Remove block?"
          okText="Remove"
          okButtonProps={{ danger: true }}
          onConfirm={() => handleDeleteBlock(record.id)}
        >
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            loading={deletingBlockId === record.id}
          >
            Remove
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const summary = snapshot?.summary;
  const averageProductiveHours = summary && summary.employeeCount > 0
    ? summary.totalProductiveMinutes / summary.employeeCount / 60
    : 0;

  const weekStartDate = dayjs(weekStart);
  const weekEndDate = dayjs(snapshot?.weekEnd ?? weekStart).format("YYYY-MM-DD");

  const tabsItems = [
    {
      key: "indicators",
      label: (
        <Space size={6}>
          <ExclamationCircleOutlined />
          Indicators
        </Space>
      ),
      children: (
        <Card size="small">
          <Space direction="vertical" size={10} style={{ width: "100%" }}>
            {summary ? (
              <Space wrap size={12}>
                <Card size="small" style={{ minWidth: 190 }}>
                  <Statistic
                    title="Conflict rate"
                    value={summary.conflictRatePercent}
                    precision={1}
                    suffix="%"
                    prefix={<ExclamationCircleOutlined />}
                  />
                </Card>
                <Card size="small" style={{ minWidth: 220 }}>
                  <Statistic
                    title="Avg productive hours"
                    value={averageProductiveHours}
                    precision={1}
                    suffix="h/employee"
                    prefix={<ClockCircleOutlined />}
                  />
                </Card>
                <Card size="small" style={{ minWidth: 190 }}>
                  <Statistic
                    title="Overallocated slots"
                    value={summary.conflictSlots}
                    suffix="days"
                    prefix={<CalendarOutlined />}
                  />
                </Card>
                <Card size="small" style={{ minWidth: 210 }}>
                  <Statistic
                    title="Planned workload"
                    value={toHours(summary.totalPlannedMinutes)}
                    precision={1}
                    suffix="h"
                  />
                </Card>
              </Space>
            ) : null}

            {summary && summary.conflictSlots > 0 ? (
              <Alert
                type="warning"
                showIcon
                message="Over-allocation alerts detected"
                description={`There are ${summary.conflictSlots} conflict slot(s) in the selected week.`}
              />
            ) : (
              <Alert
                type="success"
                showIcon
                message="No schedule conflicts for this week"
              />
            )}
          </Space>
        </Card>
      ),
    },
    {
      key: "collaborators",
      label: (
        <Space size={6}>
          <TeamOutlined />
          Collaborators
        </Space>
      ),
      children: (
        <Card size="small" title="Load by collaborator">
          <Table<EmployeeCapacityRow>
            rowKey="employeeId"
            columns={capacityColumns}
            dataSource={rows}
            loading={loading}
            pagination={{ pageSize: 2, hideOnSinglePage: true, showSizeChanger: false }}
          />
        </Card>
      ),
    },
    {
      key: "blocks",
      label: (
        <Space size={6}>
          <CalendarOutlined />
          Blocks
        </Space>
      ),
      children: (
        <Card size="small" title="Weekly blocks">
          <Table<EmployeeAvailabilityBlock>
            rowKey="id"
            columns={blockColumns}
            dataSource={blocks}
            loading={loading}
            locale={{ emptyText: "No blocks in this week." }}
            pagination={{ pageSize: 2, hideOnSinglePage: true, showSizeChanger: false }}
          />
        </Card>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Card
        size="small"
        title={
          <Space size={8}>
            <TeamOutlined />
            Team Capacity & Availability
          </Space>
        }
        extra={
          <Space>
            <DatePicker
              allowClear={false}
              value={weekStartDate}
              format="YYYY-MM-DD"
              onChange={(value) => {
                if (!value) return;
                onChangeWeek(getWeekStartDate(value.toDate()));
              }}
            />
            <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading}>
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<StopOutlined />}
              onClick={openBlockModal}
              disabled={activeEmployeeOptions.length === 0}
            >
              New block
            </Button>
          </Space>
        }
      >
        <Space direction="vertical" size={10} style={{ width: "100%" }}>
          <Typography.Text type="secondary">
            Week window: {weekStart} to {weekEndDate}
          </Typography.Text>
        </Space>
      </Card>

      <Tabs defaultActiveKey="indicators" items={tabsItems} />

      <Modal
        title={`Availability - ${selectedAvailabilityEmployee?.employeeName ?? ""}`}
        open={availabilityModalOpen}
        onCancel={() => setAvailabilityModalOpen(false)}
        onOk={handleSaveAvailability}
        okText="Save"
        cancelText="Cancel"
        confirmLoading={savingAvailability}
      >
        <Space direction="vertical" size={10} style={{ width: "100%" }}>
          <Typography.Text type="secondary">
            Define weekly working hours for this collaborator.
          </Typography.Text>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
            {weekdayEditorFields.map((field) => (
              <div key={field.key} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <Typography.Text>{field.label}</Typography.Text>
                <InputNumber
                  min={0}
                  max={24}
                  step={0.5}
                  addonAfter="h"
                  value={Number(availabilityDraftHours[field.key] ?? 0)}
                  onChange={(value) =>
                    setAvailabilityDraftHours((prev) => ({
                      ...prev,
                      [field.key]: Number(value ?? 0),
                    }))
                  }
                  style={{ width: "100%" }}
                />
              </div>
            ))}
          </div>
        </Space>
      </Modal>

      <Modal
        title="New block"
        open={blockModalOpen}
        onCancel={() => setBlockModalOpen(false)}
        onOk={handleCreateBlock}
        okText="Save block"
        cancelText="Cancel"
        confirmLoading={savingBlock}
      >
        <Form<BlockFormValues> form={blockForm} layout="vertical">
          <Form.Item name="employeeId" label="Collaborator" rules={[{ required: true, message: "Select collaborator" }]}>
            <Select
              options={activeEmployeeOptions}
              showSearch
              optionFilterProp="label"
              placeholder="Select collaborator"
            />
          </Form.Item>

          <Form.Item name="date" label="Date" rules={[{ required: true, message: "Select date" }]}>
            <DatePicker
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
              disabledDate={(current) => {
                if (!current) return false;
                const currentKey = current.format("YYYY-MM-DD");
                const startKey = snapshot?.weekStart ?? weekStart;
                const endKey = snapshot?.weekEnd ?? dayjs(startKey).add(6, "day").format("YYYY-MM-DD");
                return currentKey < startKey || currentKey > endKey;
              }}
            />
          </Form.Item>

          <Form.Item
            name="timeRange"
            label="Block time"
            rules={[{ required: true, message: "Select block time range" }]}
          >
            <TimePicker.RangePicker
              style={{ width: "100%" }}
              format="HH:mm"
              minuteStep={15}
            />
          </Form.Item>

          <Form.Item name="reason" label="Reason">
            <Input.TextArea rows={2} placeholder="Optional reason" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default EmployeeCapacityComponent;
