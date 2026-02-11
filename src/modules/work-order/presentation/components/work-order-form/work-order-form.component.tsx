import React from "react";
import { Button, DatePicker, Divider, Empty, Input, InputNumber, Select, Segmented, Space, Tabs, message } from "antd";
import dayjs, { Dayjs } from "dayjs";

import type {
  CreateWorkOrderInput,
  UpdateWorkOrderInput,
  WorkOrder,
  WorkOrderInventoryLineInput,
  WorkOrderPriority,
  WorkOrderServiceLineInput,
  WorkOrderStatus,
  WorkOrderWorkerInput,
} from "@modules/work-order/interfaces/work-order.model";
import type { EmployeeModel } from "@modules/people/interfaces/employee.model";

const priorityOptions: Array<{ value: WorkOrderPriority; label: string }> = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

type WorkOrderDraft = {
  workspaceId: string;
  title: string;
  description?: string | null;
  priority?: WorkOrderPriority;
  requesterUserUid?: string | null;
  createdBy?: string | null;
  statusId?: string;
  statusCode?: string;
  scheduledStartAt?: string | null;
  scheduledEndAt?: string | null;
  dueAt?: string | null;
  estimatedDurationMinutes?: number | null;
  actualDurationMinutes?: number | null;
  completedAt?: string | null;
  metadata?: Record<string, unknown>;
  serviceLines?: WorkOrderServiceLineInput[];
  workers?: WorkOrderWorkerInput[];
  inventoryLines?: WorkOrderInventoryLineInput[];
};

type Props = {
  workspaceId?: string;
  currentUserUid?: string | null;
  currentUserName?: string;
  employees?: EmployeeModel[];
  statuses: WorkOrderStatus[];
  initial?: WorkOrder | null;
  loading?: boolean;
  onSubmit: (payload: CreateWorkOrderInput | UpdateWorkOrderInput, id?: string) => void;
  onDelete?: (order: WorkOrder) => void;
  onCancel?: () => void;
};

type LabeledFieldProps = {
  label: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
};

const fieldContainerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  minWidth: 0,
};

const fieldLabelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "var(--color-text-muted)",
  lineHeight: 1.1,
};

function LabeledField({ label, children, style }: LabeledFieldProps) {
  return (
    <div style={{ ...fieldContainerStyle, ...style }}>
      <span style={fieldLabelStyle}>{label}</span>
      {children}
    </div>
  );
}

function toDayjs(value?: string | null): Dayjs | null {
  if (!value) return null;
  const d = dayjs(value);
  return d.isValid() ? d : null;
}

function fromDayjs(value?: Dayjs | null): string | null {
  if (!value) return null;
  return value.toISOString();
}

function buildEmptyDraft(workspaceId?: string, uid?: string | null): WorkOrderDraft {
  return {
    workspaceId: workspaceId ?? "",
    title: "",
    description: "",
    priority: "medium",
    requesterUserUid: undefined,
    createdBy: uid ?? undefined,
    statusId: undefined,
    scheduledStartAt: null,
    scheduledEndAt: null,
    dueAt: null,
    estimatedDurationMinutes: null,
    actualDurationMinutes: null,
    completedAt: null,
    metadata: {},
    serviceLines: [],
    workers: [],
    inventoryLines: [],
  };
}

function mapFromInitial(initial: WorkOrder): WorkOrderDraft {
  return {
    workspaceId: initial.workspaceId,
    title: initial.title,
    description: initial.description ?? "",
    priority: initial.priority,
    requesterUserUid: initial.requesterUserUid ?? undefined,
    createdBy: initial.createdBy ?? undefined,
    statusId: initial.status?.id,
    scheduledStartAt: initial.scheduledStartAt ?? null,
    scheduledEndAt: initial.scheduledEndAt ?? null,
    dueAt: initial.dueAt ?? null,
    estimatedDurationMinutes: initial.estimatedDurationMinutes ?? null,
    actualDurationMinutes: initial.actualDurationMinutes ?? null,
    completedAt: initial.completedAt ?? null,
    metadata: initial.metadata ?? {},
    serviceLines: (initial.serviceLines ?? []).map((line) => ({
      serviceId: line.serviceId,
      quantity: line.quantity,
      unitPriceCents: line.unitPriceCents,
      notes: line.notes ?? null,
    })),
    workers: (initial.workers ?? []).map((line) => ({
      workspaceId: line.workspaceId,
      userUid: line.userUid,
      assignmentRole: line.assignmentRole,
      allocatedMinutes: line.allocatedMinutes,
    })),
    inventoryLines: (initial.inventoryLines ?? []).map((line) => ({
      inventoryItemId: line.inventoryItemId,
      direction: line.direction,
      plannedQuantity: line.plannedQuantity,
      consumedQuantity: line.consumedQuantity,
      unitCostCents: line.unitCostCents,
    })),
  };
}

export function WorkOrderForm({
  workspaceId,
  currentUserUid,
  currentUserName,
  employees,
  statuses,
  initial,
  loading,
  onSubmit,
  onDelete,
  onCancel,
}: Props) {
  const [draft, setDraft] = React.useState<WorkOrderDraft>(() =>
    initial ? mapFromInitial(initial) : buildEmptyDraft(workspaceId, currentUserUid)
  );
  const [metadataText, setMetadataText] = React.useState<string>(() => {
    if (initial?.metadata) return JSON.stringify(initial.metadata, null, 2);
    return "{}";
  });
  const [lineMode, setLineMode] = React.useState<"services" | "inventory">("services");

  React.useEffect(() => {
    if (initial) {
      setDraft(mapFromInitial(initial));
      setMetadataText(JSON.stringify(initial.metadata ?? {}, null, 2));
      return;
    }

    setDraft(buildEmptyDraft(workspaceId, currentUserUid));
    setMetadataText("{}");
  }, [initial, workspaceId, currentUserUid]);

  React.useEffect(() => {
    if (draft.statusId || statuses.length === 0) return;
    setDraft((prev) => ({ ...prev, statusId: statuses[0]?.id }));
  }, [draft.statusId, statuses]);

  const isEditing = Boolean(initial?.id);

  const canSubmit = Boolean(workspaceId && draft.title.trim());

  const updateDraft = (patch: Partial<WorkOrderDraft>) =>
    setDraft((prev) => ({ ...prev, ...patch }));

  const updateServiceLine = (index: number, patch: Partial<WorkOrderServiceLineInput>) => {
    setDraft((prev) => {
      const lines = [...(prev.serviceLines ?? [])];
      lines[index] = { ...lines[index], ...patch };
      return { ...prev, serviceLines: lines };
    });
  };

  const addServiceLine = () => {
    setDraft((prev) => ({
      ...prev,
      serviceLines: [...(prev.serviceLines ?? []), { serviceId: "", quantity: 1, unitPriceCents: undefined }],
    }));
  };

  const removeServiceLine = (index: number) => {
    setDraft((prev) => {
      const lines = [...(prev.serviceLines ?? [])];
      lines.splice(index, 1);
      return { ...prev, serviceLines: lines };
    });
  };

  const updateWorker = (index: number, patch: Partial<WorkOrderWorkerInput>) => {
    setDraft((prev) => {
      const lines = [...(prev.workers ?? [])];
      lines[index] = { ...lines[index], ...patch } as WorkOrderWorkerInput;
      return { ...prev, workers: lines };
    });
  };

  const addWorker = () => {
    setDraft((prev) => ({
      ...prev,
      workers: [...(prev.workers ?? []), { workspaceId: workspaceId ?? "", userUid: "", assignmentRole: "executor" }],
    }));
  };

  const removeWorker = (index: number) => {
    setDraft((prev) => {
      const lines = [...(prev.workers ?? [])];
      lines.splice(index, 1);
      return { ...prev, workers: lines };
    });
  };

  const updateInventoryLine = (index: number, patch: Partial<WorkOrderInventoryLineInput>) => {
    setDraft((prev) => {
      const lines = [...(prev.inventoryLines ?? [])];
      lines[index] = { ...lines[index], ...patch } as WorkOrderInventoryLineInput;
      return { ...prev, inventoryLines: lines };
    });
  };

  const addInventoryLine = () => {
    setDraft((prev) => ({
      ...prev,
      inventoryLines: [
        ...(prev.inventoryLines ?? []),
        { inventoryItemId: "", direction: "output", plannedQuantity: 1 },
      ],
    }));
  };

  const removeInventoryLine = (index: number) => {
    setDraft((prev) => {
      const lines = [...(prev.inventoryLines ?? [])];
      lines.splice(index, 1);
      return { ...prev, inventoryLines: lines };
    });
  };

  const handleSubmit = () => {
    if (!workspaceId) return;

    let metadata: Record<string, unknown> = {};
    if (metadataText.trim()) {
      try {
        metadata = JSON.parse(metadataText);
      } catch {
        message.error("Metadata JSON is invalid.");
        return;
      }
    }

    const serviceLines = (draft.serviceLines ?? []).filter((l) => l.serviceId.trim().length > 0);
    const workers = (draft.workers ?? [])
      .filter((l) => l.userUid.trim().length > 0)
      .map((l) => ({ ...l, workspaceId: l.workspaceId || workspaceId }));
    const inventoryLines = (draft.inventoryLines ?? []).filter(
      (l) => l.inventoryItemId.trim().length > 0
    );

    const payload: CreateWorkOrderInput | UpdateWorkOrderInput = {
      ...draft,
      workspaceId,
      metadata,
      serviceLines,
      workers,
      inventoryLines,
    };

    onSubmit(payload, initial?.id);
  };

  const employeeOptions = React.useMemo(() => {
    const list = (employees ?? []).map((e) => ({
      value: e.id,
      label: `${e.firstName} ${e.lastName}`.trim(),
    }));
    return list.sort((a, b) => a.label.localeCompare(b.label));
  }, [employees]);

  const resolveEmployeeLabel = React.useCallback(
    (uid?: string | null) => {
      if (!uid) return "";
      const found = employeeOptions.find((opt) => opt.value === uid);
      if (found?.label) return found.label;
      if (currentUserName && uid === currentUserUid) return currentUserName;
      return uid;
    },
    [employeeOptions, currentUserName, currentUserUid]
  );

  React.useEffect(() => {
    if (!currentUserUid) return;
    if (!initial) {
      setDraft((prev) => ({ ...prev, createdBy: currentUserUid || prev.createdBy }));
    }
  }, [currentUserUid, initial]);

  if (!workspaceId) {
    return (
      <Empty
        description="Select or create a workspace to manage work orders."
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 600, fontSize: 16 }}>
          {isEditing ? "Edit work order" : "New work order"}
        </div>
        <Space>
          {onCancel ? <Button onClick={onCancel}>Clear</Button> : null}
          {isEditing && initial && onDelete ? (
            <Button danger onClick={() => onDelete(initial)}>
              Delete
            </Button>
          ) : null}
        </Space>
      </div>

      <Tabs
        defaultActiveKey="general"
        items={[
          {
            key: "general",
            label: "General",
            children: (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <LabeledField label="Title">
                  <Input
                    placeholder="Title"
                    value={draft.title}
                    onChange={(e) => updateDraft({ title: e.target.value })}
                  />
                </LabeledField>
                <LabeledField label="Description">
                  <Input.TextArea
                    placeholder="Description"
                    value={draft.description ?? ""}
                    onChange={(e) => updateDraft({ description: e.target.value })}
                    rows={3}
                  />
                </LabeledField>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
                  <LabeledField label="Priority">
                    <Select
                      placeholder="Priority"
                      value={draft.priority}
                      options={priorityOptions}
                      onChange={(value) => updateDraft({ priority: value })}
                    />
                  </LabeledField>
                  <LabeledField label="Status">
                    <Select
                      placeholder="Status"
                      value={draft.statusId}
                      options={statuses.map((s) => ({ value: s.id, label: s.label }))}
                      onChange={(value) => updateDraft({ statusId: value })}
                    />
                  </LabeledField>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
                  <LabeledField label="Requester">
                    <Select
                      placeholder="Select requester"
                      value={draft.requesterUserUid || undefined}
                      allowClear
                      showSearch
                      optionFilterProp="label"
                      options={employeeOptions}
                      onChange={(value) => updateDraft({ requesterUserUid: value })}
                      filterOption={(input, option) =>
                        String(option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    />
                  </LabeledField>
                  <LabeledField label="Created by">
                    <Input
                      placeholder="Created by"
                      value={resolveEmployeeLabel(draft.createdBy ?? currentUserUid)}
                      disabled
                    />
                  </LabeledField>
                </div>

                <LabeledField label="Metadata (JSON)">
                  <Input.TextArea
                    placeholder="Metadata (JSON)"
                    value={metadataText}
                    onChange={(e) => setMetadataText(e.target.value)}
                    rows={4}
                  />
                </LabeledField>
              </div>
            ),
          },
          {
            key: "schedule",
            label: "Schedule",
            children: (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
                  <LabeledField label="Scheduled start">
                    <DatePicker
                      showTime
                      placeholder="Scheduled start"
                      value={toDayjs(draft.scheduledStartAt)}
                      onChange={(value) => updateDraft({ scheduledStartAt: fromDayjs(value) })}
                    />
                  </LabeledField>
                  <LabeledField label="Scheduled end">
                    <DatePicker
                      showTime
                      placeholder="Scheduled end"
                      value={toDayjs(draft.scheduledEndAt)}
                      onChange={(value) => updateDraft({ scheduledEndAt: fromDayjs(value) })}
                    />
                  </LabeledField>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
                  <LabeledField label="Due at">
                    <DatePicker
                      showTime
                      placeholder="Due at"
                      value={toDayjs(draft.dueAt)}
                      onChange={(value) => updateDraft({ dueAt: fromDayjs(value) })}
                    />
                  </LabeledField>
                  <LabeledField label="Estimated duration (min)">
                    <InputNumber
                      min={0}
                      placeholder="Estimated duration (min)"
                      value={draft.estimatedDurationMinutes ?? undefined}
                      onChange={(value) => updateDraft({ estimatedDurationMinutes: value ?? null })}
                      style={{ width: "100%" }}
                    />
                  </LabeledField>
                </div>

                {isEditing ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
                    <LabeledField label="Actual duration (min)">
                      <InputNumber
                        min={0}
                        placeholder="Actual duration (min)"
                        value={draft.actualDurationMinutes ?? undefined}
                        onChange={(value) => updateDraft({ actualDurationMinutes: value ?? null })}
                        style={{ width: "100%" }}
                      />
                    </LabeledField>
                    <LabeledField label="Completed at">
                      <DatePicker
                        showTime
                        placeholder="Completed at"
                        value={toDayjs(draft.completedAt)}
                        onChange={(value) => updateDraft({ completedAt: fromDayjs(value) })}
                      />
                    </LabeledField>
                  </div>
                ) : null}
              </div>
            ),
          },
          {
            key: "team",
            label: "Team",
            children: (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 600 }}>Workers</div>
                  <Button onClick={addWorker}>Add worker</Button>
                </div>

                {(draft.workers ?? []).length === 0 ? (
                  <div style={{ color: "var(--color-text-muted)" }}>No workers assigned.</div>
                ) : null}

                {(draft.workers ?? []).map((line, idx) => (
                  <Space key={`worker-${idx}`} wrap style={{ width: "100%" }} align="start">
                    <LabeledField label="User UID" style={{ width: 220 }}>
                      <Input
                        placeholder="User UID"
                        value={line.userUid}
                        onChange={(e) => updateWorker(idx, { userUid: e.target.value })}
                        style={{ width: "100%" }}
                      />
                    </LabeledField>
                    <LabeledField label="Role" style={{ width: 170 }}>
                      <Select
                        value={line.assignmentRole}
                        style={{ width: "100%" }}
                        options={[
                          { value: "executor", label: "Executor" },
                          { value: "assistant", label: "Assistant" },
                          { value: "reviewer", label: "Reviewer" },
                        ]}
                        onChange={(value) => updateWorker(idx, { assignmentRole: value })}
                      />
                    </LabeledField>
                    <LabeledField label="Allocated minutes" style={{ width: 150 }}>
                      <InputNumber
                        min={0}
                        placeholder="Minutes"
                        value={line.allocatedMinutes}
                        onChange={(value) => updateWorker(idx, { allocatedMinutes: value ?? undefined })}
                        style={{ width: "100%" }}
                      />
                    </LabeledField>
                    <div style={{ display: "flex", alignItems: "flex-end", minHeight: "100%" }}>
                      <Button danger onClick={() => removeWorker(idx)}>
                        Remove
                      </Button>
                    </div>
                  </Space>
                ))}
              </div>
            ),
          },
          {
            key: "lines",
            label: "Lines",
            children: (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <LabeledField label="Line type">
                  <Segmented
                    value={lineMode}
                    options={[
                      { label: "Services", value: "services" },
                      { label: "Inventory", value: "inventory" },
                    ]}
                    onChange={(value) => setLineMode(value as "services" | "inventory")}
                  />
                </LabeledField>

                {lineMode === "services" ? (
                  <>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ fontWeight: 600 }}>Service lines</div>
                      <Button onClick={addServiceLine}>Add service</Button>
                    </div>

                    {(draft.serviceLines ?? []).length === 0 ? (
                      <div style={{ color: "var(--color-text-muted)" }}>No service lines.</div>
                    ) : null}

                    {(draft.serviceLines ?? []).map((line, idx) => (
                      <Space key={`service-${idx}`} wrap style={{ width: "100%" }} align="start">
                        <LabeledField label="Service ID" style={{ width: 190 }}>
                          <Input
                            placeholder="Service ID"
                            value={line.serviceId}
                            onChange={(e) => updateServiceLine(idx, { serviceId: e.target.value })}
                            style={{ width: "100%" }}
                          />
                        </LabeledField>
                        <LabeledField label="Quantity" style={{ width: 110 }}>
                          <InputNumber
                            min={1}
                            placeholder="Qty"
                            value={line.quantity}
                            onChange={(value) => updateServiceLine(idx, { quantity: value ?? undefined })}
                            style={{ width: "100%" }}
                          />
                        </LabeledField>
                        <LabeledField label="Unit price (cents)" style={{ width: 170 }}>
                          <InputNumber
                            min={0}
                            placeholder="Unit price (cents)"
                            value={line.unitPriceCents}
                            onChange={(value) => updateServiceLine(idx, { unitPriceCents: value ?? undefined })}
                            style={{ width: "100%" }}
                          />
                        </LabeledField>
                        <LabeledField label="Notes" style={{ width: 220 }}>
                          <Input
                            placeholder="Notes"
                            value={line.notes ?? ""}
                            onChange={(e) => updateServiceLine(idx, { notes: e.target.value })}
                            style={{ width: "100%" }}
                          />
                        </LabeledField>
                        <div style={{ display: "flex", alignItems: "flex-end", minHeight: "100%" }}>
                          <Button danger onClick={() => removeServiceLine(idx)}>
                            Remove
                          </Button>
                        </div>
                      </Space>
                    ))}
                  </>
                ) : (
                  <>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ fontWeight: 600 }}>Inventory lines</div>
                      <Button onClick={addInventoryLine}>Add item</Button>
                    </div>

                    {(draft.inventoryLines ?? []).length === 0 ? (
                      <div style={{ color: "var(--color-text-muted)" }}>No inventory items.</div>
                    ) : null}

                    {(draft.inventoryLines ?? []).map((line, idx) => (
                      <Space key={`inventory-${idx}`} wrap style={{ width: "100%" }} align="start">
                        <LabeledField label="Inventory item ID" style={{ width: 220 }}>
                          <Input
                            placeholder="Inventory item ID"
                            value={line.inventoryItemId}
                            onChange={(e) => updateInventoryLine(idx, { inventoryItemId: e.target.value })}
                            style={{ width: "100%" }}
                          />
                        </LabeledField>
                        <LabeledField label="Direction" style={{ width: 130 }}>
                          <Select
                            value={line.direction}
                            style={{ width: "100%" }}
                            options={[
                              { value: "input", label: "Input" },
                              { value: "output", label: "Output" },
                            ]}
                            onChange={(value) => updateInventoryLine(idx, { direction: value })}
                          />
                        </LabeledField>
                        <LabeledField label="Planned quantity" style={{ width: 120 }}>
                          <InputNumber
                            min={0}
                            placeholder="Planned"
                            value={line.plannedQuantity}
                            onChange={(value) => updateInventoryLine(idx, { plannedQuantity: value ?? undefined })}
                            style={{ width: "100%" }}
                          />
                        </LabeledField>
                        <LabeledField label="Consumed quantity" style={{ width: 120 }}>
                          <InputNumber
                            min={0}
                            placeholder="Consumed"
                            value={line.consumedQuantity}
                            onChange={(value) => updateInventoryLine(idx, { consumedQuantity: value ?? undefined })}
                            style={{ width: "100%" }}
                          />
                        </LabeledField>
                        <LabeledField label="Unit cost (cents)" style={{ width: 170 }}>
                          <InputNumber
                            min={0}
                            placeholder="Unit cost (cents)"
                            value={line.unitCostCents}
                            onChange={(value) => updateInventoryLine(idx, { unitCostCents: value ?? undefined })}
                            style={{ width: "100%" }}
                          />
                        </LabeledField>
                        <div style={{ display: "flex", alignItems: "flex-end", minHeight: "100%" }}>
                          <Button danger onClick={() => removeInventoryLine(idx)}>
                            Remove
                          </Button>
                        </div>
                      </Space>
                    ))}
                  </>
                )}
              </div>
            ),
          },
        ]}
      />

      <Divider style={{ margin: "0" }} />

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button type="primary" loading={loading} disabled={!canSubmit} onClick={handleSubmit}>
          {isEditing ? "Save changes" : "Create work order"}
        </Button>
      </div>
    </div>
  );
}

export default WorkOrderForm;
