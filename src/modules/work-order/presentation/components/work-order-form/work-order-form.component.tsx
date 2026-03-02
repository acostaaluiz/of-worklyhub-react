import React from "react";
import {
  Button,
  Checkbox,
  DatePicker,
  Divider,
  Empty,
  Input,
  InputNumber,
  List,
  Modal,
  Popconfirm,
  Select,
  Segmented,
  Space,
  Tabs,
  Timeline,
  Typography,
  Upload,
  type UploadProps,
  message,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import dayjs from "dayjs";

import type {
  CreateWorkOrderInput,
  UpdateWorkOrderInput,
  WorkOrder,
  WorkOrderChecklistItem,
  WorkOrderComment,
  WorkOrderInventoryLineInput,
  WorkOrderPriority,
  WorkOrderServiceLineInput,
  WorkOrderStatusHistoryEntry,
  WorkOrderStatus,
  WorkOrderWorkerInput,
} from "@modules/work-order/interfaces/work-order.model";
import type { EmployeeModel } from "@modules/people/interfaces/employee.model";
import type { CompanyServiceModel } from "@modules/company/interfaces/service.model";
import type { InventoryItem } from "@modules/inventory/services/inventory-api";
import {
  createWorkOrderChecklistItem,
  createWorkOrderComment,
  deleteWorkOrderChecklistItem,
  listWorkOrderChecklist,
  listWorkOrderComments,
  listWorkOrderHistory,
  updateWorkOrderChecklistItem,
} from "@modules/work-order/services/work-order.http.service";
import {
  APP_DATE_TIME_FORMAT,
  APP_TIME_FORMAT,
  formatAppDateTime,
  toDayjsValue,
  toIsoDateTimeValue,
} from "@core/utils/date-time";

const priorityOptions: Array<{ value: WorkOrderPriority; label: string }> = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const attachmentAccept =
  "image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.ppt,.pptx,.zip,.rar";
const maxAttachmentSizeMb = 25;

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
  metadata?: DataMap;
  serviceLines?: WorkOrderServiceLineInput[];
  workers?: WorkOrderWorkerInput[];
  inventoryLines?: WorkOrderInventoryLineInput[];
};

type Props = {
  workspaceId?: string;
  currentUserUid?: string | null;
  currentUserName?: string;
  employees?: EmployeeModel[];
  services?: CompanyServiceModel[];
  inventoryItems?: InventoryItem[];
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

function formatDateTime(value?: string | null): string {
  return formatAppDateTime(value, "--");
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
  services,
  inventoryItems,
  statuses,
  initial,
  loading,
  onSubmit,
  onDelete,
  onCancel,
}: Props) {
  const isMobileViewport =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 768px)").matches;

  const [draft, setDraft] = React.useState<WorkOrderDraft>(() =>
    initial ? mapFromInitial(initial) : buildEmptyDraft(workspaceId, currentUserUid)
  );
  const [metadataText, setMetadataText] = React.useState<string>(() => {
    if (initial?.metadata) return JSON.stringify(initial.metadata, null, 2);
    return "{}";
  });
  const [lineMode, setLineMode] = React.useState<"services" | "inventory">("services");
  const [history, setHistory] = React.useState<WorkOrderStatusHistoryEntry[]>([]);
  const [comments, setComments] = React.useState<WorkOrderComment[]>([]);
  const [checklist, setChecklist] = React.useState<WorkOrderChecklistItem[]>([]);
  const [activityLoading, setActivityLoading] = React.useState(false);
  const [commentDraft, setCommentDraft] = React.useState("");
  const [commentSaving, setCommentSaving] = React.useState(false);
  const [checklistTitle, setChecklistTitle] = React.useState("");
  const [checklistSortOrder, setChecklistSortOrder] = React.useState<number | null>(null);
  const [checklistSaving, setChecklistSaving] = React.useState(false);
  const [checklistEditingId, setChecklistEditingId] = React.useState<string | null>(null);
  const [checklistEditDraft, setChecklistEditDraft] = React.useState<{ title: string; sortOrder: number | null }>({
    title: "",
    sortOrder: null,
  });
  const [checklistBusyId, setChecklistBusyId] = React.useState<string | null>(null);
  const [attachmentsOpen, setAttachmentsOpen] = React.useState(false);
  const [attachmentFiles, setAttachmentFiles] = React.useState<UploadFile[]>([]);
  const attachmentPreviewUrlsRef = React.useRef<Record<string, string>>({});

  const clearAttachmentPreviewUrls = React.useCallback(() => {
    Object.values(attachmentPreviewUrlsRef.current).forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // ignore URL cleanup errors
      }
    });
    attachmentPreviewUrlsRef.current = {};
  }, []);

  const getAttachmentPreviewUrl = React.useCallback((file: UploadFile) => {
    if (typeof file.url === "string" && file.url.trim()) return file.url;
    const existing = attachmentPreviewUrlsRef.current[file.uid];
    if (existing) return existing;
    if (!file.originFileObj) return null;

    try {
      const generatedUrl = URL.createObjectURL(file.originFileObj as File);
      attachmentPreviewUrlsRef.current[file.uid] = generatedUrl;
      return generatedUrl;
    } catch {
      return null;
    }
  }, []);

  const releaseAttachmentPreviewUrl = React.useCallback((uid: string) => {
    const existing = attachmentPreviewUrlsRef.current[uid];
    if (!existing) return;
    try {
      URL.revokeObjectURL(existing);
    } catch {
      // ignore URL cleanup errors
    }
    delete attachmentPreviewUrlsRef.current[uid];
  }, []);

  const openAttachmentPreview = React.useCallback(
    (file: UploadFile) => {
      const previewUrl = getAttachmentPreviewUrl(file);
      if (!previewUrl) {
        message.info("Unable to preview this file.");
        return;
      }
      window.open(previewUrl, "_blank", "noopener,noreferrer");
    },
    [getAttachmentPreviewUrl]
  );

  const removeAttachmentByUid = React.useCallback(
    (uid: string) => {
      releaseAttachmentPreviewUrl(uid);
      setAttachmentFiles((prev) => prev.filter((file) => file.uid !== uid));
    },
    [releaseAttachmentPreviewUrl]
  );

  const handleAttachmentBeforeUpload = React.useCallback<NonNullable<UploadProps["beforeUpload"]>>(
    (file) => {
      const fileSizeMb = file.size / (1024 * 1024);
      if (fileSizeMb > maxAttachmentSizeMb) {
        message.error(`File "${file.name}" exceeds ${maxAttachmentSizeMb} MB.`);
        return Upload.LIST_IGNORE;
      }
      return false;
    },
    []
  );

  const handleAttachmentChange = React.useCallback<NonNullable<UploadProps["onChange"]>>(
    ({ fileList }) => {
      setAttachmentFiles(fileList);
    },
    []
  );

  const handleAttachmentRemove = React.useCallback<NonNullable<UploadProps["onRemove"]>>(
    (file) => {
      releaseAttachmentPreviewUrl(file.uid);
      return true;
    },
    [releaseAttachmentPreviewUrl]
  );

  const handleAttachmentPreview = React.useCallback<NonNullable<UploadProps["onPreview"]>>(
    async (file) => {
      openAttachmentPreview(file);
    },
    [openAttachmentPreview]
  );

  React.useEffect(() => {
    if (initial) {
      setDraft(mapFromInitial(initial));
      setMetadataText(JSON.stringify(initial.metadata ?? {}, null, 2));
      setAttachmentFiles([]);
      setAttachmentsOpen(false);
      clearAttachmentPreviewUrls();
      return;
    }

    setDraft(buildEmptyDraft(workspaceId, currentUserUid));
    setMetadataText("{}");
    setAttachmentFiles([]);
    setAttachmentsOpen(false);
    clearAttachmentPreviewUrls();
  }, [initial, workspaceId, currentUserUid, clearAttachmentPreviewUrls]);

  React.useEffect(() => {
    return () => {
      clearAttachmentPreviewUrls();
    };
  }, [clearAttachmentPreviewUrls]);

  React.useEffect(() => {
    if (draft.statusId || statuses.length === 0) return;
    setDraft((prev) => ({ ...prev, statusId: statuses[0]?.id }));
  }, [draft.statusId, statuses]);

  const workOrderId = initial?.id ?? null;
  const isEditing = Boolean(workOrderId);
  const canManageActivity = Boolean(workspaceId && workOrderId);
  const activityUpdatedAt = initial?.updatedAt ?? "";

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

    let metadata: DataMap = {};
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

  const workerOptions = React.useMemo(() => {
    const optionsMap = new Map<string, { value: string; label: string }>();
    employeeOptions.forEach((opt) => {
      optionsMap.set(opt.value, opt);
    });

    (draft.workers ?? []).forEach((worker) => {
      const uid = worker.userUid?.trim();
      if (!uid || optionsMap.has(uid)) return;
      optionsMap.set(uid, {
        value: uid,
        label: resolveEmployeeLabel(uid),
      });
    });

    return Array.from(optionsMap.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [employeeOptions, draft.workers, resolveEmployeeLabel]);

  const serviceOptions = React.useMemo(() => {
    const optionsMap = new Map<string, { value: string; label: string }>();
    (services ?? []).forEach((service) => {
      if (!service.id) return;
      const label = service.title?.trim() || service.id;
      optionsMap.set(service.id, { value: service.id, label });
    });

    (draft.serviceLines ?? []).forEach((line) => {
      const serviceId = line.serviceId?.trim();
      if (!serviceId || optionsMap.has(serviceId)) return;
      optionsMap.set(serviceId, { value: serviceId, label: serviceId });
    });

    return Array.from(optionsMap.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [services, draft.serviceLines]);

  const inventoryById = React.useMemo(() => {
    const map = new Map<string, InventoryItem>();
    (inventoryItems ?? []).forEach((item) => {
      if (!item.id) return;
      map.set(item.id, item);
    });
    return map;
  }, [inventoryItems]);

  const inventoryItemOptions = React.useMemo(() => {
    const optionsMap = new Map<string, { value: string; label: string; disabled?: boolean }>();
    (inventoryItems ?? []).forEach((item) => {
      if (!item.id) return;
      const baseLabel = item.sku ? `${item.name} (${item.sku})` : item.name;
      const stockLabel = `Stock: ${Math.max(0, Number(item.quantity ?? 0))}`;
      const inactiveLabel = item.isActive ? "" : " - Inactive";
      optionsMap.set(item.id, {
        value: item.id,
        label: `${baseLabel} - ${stockLabel}${inactiveLabel}`,
        disabled: !item.isActive,
      });
    });

    (draft.inventoryLines ?? []).forEach((line) => {
      const itemId = line.inventoryItemId?.trim();
      if (!itemId || optionsMap.has(itemId)) return;
      optionsMap.set(itemId, { value: itemId, label: itemId });
    });

    return Array.from(optionsMap.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [inventoryItems, draft.inventoryLines]);

  const sortedHistory = React.useMemo(() => {
    return [...history].sort((a, b) => {
      const aTime = dayjs(a.changedAt).valueOf();
      const bTime = dayjs(b.changedAt).valueOf();
      return bTime - aTime;
    });
  }, [history]);

  const sortedComments = React.useMemo(() => {
    return [...comments].sort((a, b) => {
      const aTime = dayjs(a.createdAt).valueOf();
      const bTime = dayjs(b.createdAt).valueOf();
      return bTime - aTime;
    });
  }, [comments]);

  const sortedChecklist = React.useMemo(() => {
    return [...checklist].sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      const aTime = dayjs(a.createdAt).valueOf();
      const bTime = dayjs(b.createdAt).valueOf();
      return aTime - bTime;
    });
  }, [checklist]);

  const loadActivity = React.useCallback(async () => {
    if (!workspaceId || !workOrderId) return;
    setActivityLoading(true);
    try {
      const [historyRows, commentRows, checklistRows] = await Promise.all([
        listWorkOrderHistory(workspaceId, workOrderId),
        listWorkOrderComments(workspaceId, workOrderId),
        listWorkOrderChecklist(workspaceId, workOrderId),
      ]);
      setHistory(historyRows ?? []);
      setComments(commentRows ?? []);
      setChecklist(checklistRows ?? []);
    } catch (err) {
      message.error("Failed to load work order activity.");
    } finally {
      setActivityLoading(false);
    }
  }, [workspaceId, workOrderId]);

  React.useEffect(() => {
    if (!canManageActivity) {
      setHistory([]);
      setComments([]);
      setChecklist([]);
      setCommentDraft("");
      setChecklistTitle("");
      setChecklistSortOrder(null);
      setChecklistEditingId(null);
      return;
    }

    loadActivity();
  }, [canManageActivity, loadActivity, activityUpdatedAt]);

  const handleAddComment = async () => {
    if (!workspaceId || !workOrderId) return;
    const body = commentDraft.trim();
    if (!body) {
      message.info("Write a comment before posting.");
      return;
    }
    setCommentSaving(true);
    try {
      const created = await createWorkOrderComment(workspaceId, workOrderId, {
        body,
        authorUid: currentUserUid ?? undefined,
      });
      setComments((prev) => [created, ...prev]);
      setCommentDraft("");
      message.success("Comment added.");
    } catch (err) {
      message.error("Failed to add comment.");
    } finally {
      setCommentSaving(false);
    }
  };

  const inferChecklistSortOrder = React.useCallback(() => {
    const max = checklist.reduce((acc, item) => Math.max(acc, item.sortOrder ?? 0), 0);
    return max > 0 ? max + 10 : 10;
  }, [checklist]);

  const handleAddChecklistItem = async () => {
    if (!workspaceId || !workOrderId) return;
    const title = checklistTitle.trim();
    if (!title) {
      message.info("Provide a checklist title.");
      return;
    }
    const sortOrder =
      typeof checklistSortOrder === "number" ? checklistSortOrder : inferChecklistSortOrder();

    setChecklistSaving(true);
    try {
      const created = await createWorkOrderChecklistItem(workspaceId, workOrderId, {
        title,
        sortOrder,
        createdBy: currentUserUid ?? undefined,
      });
      setChecklist((prev) => [...prev, created]);
      setChecklistTitle("");
      setChecklistSortOrder(null);
      message.success("Checklist item added.");
    } catch (err) {
      message.error("Failed to add checklist item.");
    } finally {
      setChecklistSaving(false);
    }
  };

  const handleToggleChecklistItem = async (item: WorkOrderChecklistItem) => {
    if (!workspaceId || !workOrderId) return;
    const nextIsDone = !item.isDone;
    setChecklistBusyId(item.id);
    try {
      const updated = await updateWorkOrderChecklistItem(workspaceId, workOrderId, item.id, {
        isDone: nextIsDone,
        completedBy: nextIsDone ? currentUserUid ?? undefined : null,
      });
      setChecklist((prev) => prev.map((row) => (row.id === item.id ? updated : row)));
    } catch (err) {
      message.error("Failed to update checklist item.");
    } finally {
      setChecklistBusyId(null);
    }
  };

  const handleStartEditChecklist = (item: WorkOrderChecklistItem) => {
    setChecklistEditingId(item.id);
    setChecklistEditDraft({ title: item.title, sortOrder: item.sortOrder ?? null });
  };

  const handleCancelEditChecklist = () => {
    setChecklistEditingId(null);
  };

  const handleSaveEditChecklist = async () => {
    if (!workspaceId || !workOrderId || !checklistEditingId) return;
    const current = checklist.find((item) => item.id === checklistEditingId);
    if (!current) {
      setChecklistEditingId(null);
      return;
    }
    const nextTitle = checklistEditDraft.title.trim();
    const patch: { title?: string; sortOrder?: number } = {};
    if (nextTitle && nextTitle !== current.title) patch.title = nextTitle;
    if (
      typeof checklistEditDraft.sortOrder === "number" &&
      checklistEditDraft.sortOrder !== current.sortOrder
    ) {
      patch.sortOrder = checklistEditDraft.sortOrder;
    }
    if (Object.keys(patch).length === 0) {
      setChecklistEditingId(null);
      return;
    }

    setChecklistBusyId(checklistEditingId);
    try {
      const updated = await updateWorkOrderChecklistItem(
        workspaceId,
        workOrderId,
        checklistEditingId,
        patch
      );
      setChecklist((prev) => prev.map((row) => (row.id === checklistEditingId ? updated : row)));
      setChecklistEditingId(null);
      message.success("Checklist item updated.");
    } catch (err) {
      message.error("Failed to update checklist item.");
    } finally {
      setChecklistBusyId(null);
    }
  };

  const handleDeleteChecklistItem = async (itemId: string) => {
    if (!workspaceId || !workOrderId) return;
    setChecklistBusyId(itemId);
    try {
      await deleteWorkOrderChecklistItem(workspaceId, workOrderId, itemId);
      setChecklist((prev) => prev.filter((row) => row.id !== itemId));
      if (checklistEditingId === itemId) setChecklistEditingId(null);
      message.success("Checklist item removed.");
    } catch (err) {
      message.error("Failed to delete checklist item.");
    } finally {
      setChecklistBusyId(null);
    }
  };

  React.useEffect(() => {
    if (!currentUserUid) return;
    if (!initial) {
      setDraft((prev) => ({ ...prev, createdBy: currentUserUid || prev.createdBy }));
    }
  }, [currentUserUid, initial]);

  const activityContent = !canManageActivity ? (
    <Empty
      description="Create the work order to access history, comments, and checklist."
      image={Empty.PRESENTED_IMAGE_SIMPLE}
    />
  ) : (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 600 }}>Activity</div>
        <Button size="small" onClick={loadActivity} loading={activityLoading}>
          Refresh
        </Button>
      </div>

      <Tabs
        size="small"
        items={[
          {
            key: "activity-history",
            label: "History",
            children: activityLoading ? (
              <div style={{ color: "var(--color-text-muted)" }}>Loading history...</div>
            ) : sortedHistory.length === 0 ? (
              <div style={{ color: "var(--color-text-muted)" }}>No status history yet.</div>
            ) : (
              <Timeline
                items={sortedHistory.map((entry) => {
                  const previous = entry.previousStatus?.label ?? "—";
                  const next = entry.newStatus?.label ?? "—";
                  const changedBy = entry.changedBy ? resolveEmployeeLabel(entry.changedBy) : "System";
                  const title = entry.previousStatus ? `${previous} → ${next}` : `${next}`;
                  return {
                    children: (
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <div style={{ fontWeight: 600 }}>{title}</div>
                        <div style={{ color: "var(--color-text-muted)", fontSize: 12 }}>
                          {formatDateTime(entry.changedAt)} • {changedBy}
                        </div>
                        {entry.notes ? <div style={{ fontSize: 12 }}>{entry.notes}</div> : null}
                      </div>
                    ),
                  };
                })}
              />
            ),
          },
          {
            key: "activity-comments",
            label: "Comments",
            children: (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <LabeledField label="New comment">
                  <Input.TextArea
                    placeholder="Write a comment"
                    value={commentDraft}
                    onChange={(e) => setCommentDraft(e.target.value)}
                    rows={3}
                  />
                </LabeledField>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    type="primary"
                    size="small"
                    onClick={handleAddComment}
                    loading={commentSaving}
                    disabled={!commentDraft.trim()}
                  >
                    Post comment
                  </Button>
                </div>
                <Divider style={{ margin: "4px 0" }} />
                <List
                  loading={activityLoading}
                  dataSource={sortedComments}
                  locale={{ emptyText: "No comments yet." }}
                  renderItem={(comment) => {
                    const author = comment.authorUid
                      ? resolveEmployeeLabel(comment.authorUid)
                      : "System";
                    return (
                      <List.Item style={{ alignItems: "flex-start" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <div style={{ fontWeight: 600 }}>{author}</div>
                          <div style={{ color: "var(--color-text-muted)", fontSize: 12 }}>
                            {formatDateTime(comment.createdAt)}
                          </div>
                          <div>{comment.body}</div>
                        </div>
                      </List.Item>
                    );
                  }}
                />
              </div>
            ),
          },
          {
            key: "activity-checklist",
            label: "Checklist",
            children: (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>
                  <LabeledField label="Title" style={{ flex: 1, minWidth: 220 }}>
                    <Input
                      placeholder="Checklist item"
                      value={checklistTitle}
                      onChange={(e) => setChecklistTitle(e.target.value)}
                    />
                  </LabeledField>
                  <LabeledField label="Sort order" style={{ width: 140 }}>
                    <InputNumber
                      min={0}
                      placeholder="Order"
                      value={checklistSortOrder ?? undefined}
                      onChange={(value) => setChecklistSortOrder(value ?? null)}
                      style={{ width: "100%" }}
                    />
                  </LabeledField>
                  <Button
                    type="primary"
                    size="small"
                    onClick={handleAddChecklistItem}
                    loading={checklistSaving}
                    disabled={!checklistTitle.trim()}
                  >
                    Add item
                  </Button>
                </div>

                <List
                  loading={activityLoading}
                  dataSource={sortedChecklist}
                  locale={{ emptyText: "No checklist items yet." }}
                  renderItem={(item) => {
                    const isEditingItem = checklistEditingId === item.id;
                    const isBusy = checklistBusyId === item.id;
                    const completedBy = item.completedBy ? resolveEmployeeLabel(item.completedBy) : "";
                    const completionLabel = item.isDone
                      ? `Completed ${formatDateTime(item.completedAt)}${completedBy ? ` by ${completedBy}` : ""}`
                      : "Pending";

                    if (isEditingItem) {
                      return (
                        <List.Item
                          actions={[
                            <Button
                              key="save"
                              type="primary"
                              size="small"
                              onClick={handleSaveEditChecklist}
                              loading={isBusy}
                            >
                              Save
                            </Button>,
                            <Button
                              key="cancel"
                              size="small"
                              onClick={handleCancelEditChecklist}
                              disabled={isBusy}
                            >
                              Cancel
                            </Button>,
                          ]}
                        >
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, width: "100%" }}>
                            <Input
                              placeholder="Checklist title"
                              value={checklistEditDraft.title}
                              onChange={(e) =>
                                setChecklistEditDraft((prev) => ({ ...prev, title: e.target.value }))
                              }
                              style={{ flex: 1, minWidth: 220 }}
                            />
                            <InputNumber
                              min={0}
                              placeholder="Order"
                              value={checklistEditDraft.sortOrder ?? undefined}
                              onChange={(value) =>
                                setChecklistEditDraft((prev) => ({ ...prev, sortOrder: value ?? null }))
                              }
                            />
                          </div>
                        </List.Item>
                      );
                    }

                    return (
                      <List.Item
                        actions={[
                          <Button
                            key="edit"
                            size="small"
                            onClick={() => handleStartEditChecklist(item)}
                            disabled={isBusy}
                          >
                            Edit
                          </Button>,
                          <Popconfirm
                            key="delete"
                            title="Delete checklist item?"
                            okText="Delete"
                            okButtonProps={{ danger: true }}
                            onConfirm={() => handleDeleteChecklistItem(item.id)}
                          >
                            <Button danger size="small" disabled={isBusy}>
                              Delete
                            </Button>
                          </Popconfirm>,
                        ]}
                      >
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
                          <Checkbox
                            checked={item.isDone}
                            onChange={() => handleToggleChecklistItem(item)}
                            disabled={isBusy}
                          >
                            <span style={{ textDecoration: item.isDone ? "line-through" : "none" }}>
                              {item.title}
                            </span>
                          </Checkbox>
                          <div style={{ color: "var(--color-text-muted)", fontSize: 12 }}>
                            Order: {item.sortOrder} • {completionLabel}
                          </div>
                        </div>
                      </List.Item>
                    );
                  }}
                />
              </div>
            ),
          },
        ]}
      />
    </div>
  );

  const attachmentsModal = (
    <Modal
      title={`Attachments (${attachmentFiles.length})`}
      open={attachmentsOpen}
      onCancel={() => setAttachmentsOpen(false)}
      footer={[
        <Button key="close" onClick={() => setAttachmentsOpen(false)}>
          Close
        </Button>,
      ]}
      width={760}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ color: "var(--color-text-muted)", fontSize: 12 }}>
          Front-only mode: attachments are kept in local memory and are not sent to backend yet.
        </div>

        <Upload.Dragger
          multiple
          accept={attachmentAccept}
          beforeUpload={handleAttachmentBeforeUpload}
          onChange={handleAttachmentChange}
          onRemove={handleAttachmentRemove}
          onPreview={handleAttachmentPreview}
          fileList={attachmentFiles}
        >
          <p style={{ marginBottom: 8, fontWeight: 600 }}>Click or drag files to attach</p>
          <p style={{ margin: 0, color: "var(--color-text-muted)" }}>
            Photos and documents up to {maxAttachmentSizeMb} MB per file.
          </p>
        </Upload.Dragger>

        <Divider style={{ margin: "4px 0" }} />

        <div style={{ fontWeight: 600 }}>Attached files</div>
        <List
          dataSource={attachmentFiles}
          locale={{ emptyText: "No attachments yet." }}
          renderItem={(file) => {
            const fileSize =
              typeof file.size === "number" ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "";
            return (
              <List.Item
                actions={[
                  <Button
                    key={`view-${file.uid}`}
                    size="small"
                    onClick={() => openAttachmentPreview(file)}
                  >
                    View
                  </Button>,
                  <Button
                    key={`remove-${file.uid}`}
                    size="small"
                    danger
                    onClick={() => removeAttachmentByUid(file.uid)}
                  >
                    Remove
                  </Button>,
                ]}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <div style={{ fontWeight: 500 }}>{file.name}</div>
                  <div style={{ color: "var(--color-text-muted)", fontSize: 12 }}>
                    {file.type || "DataValue type"}
                    {fileSize ? ` • ${fileSize}` : ""}
                  </div>
                </div>
              </List.Item>
            );
          }}
        />
      </div>
    </Modal>
  );

  if (!workspaceId) {
    return (
      <Empty
        description="Select or create a workspace to manage work orders."
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%", minHeight: 0, maxWidth: "100%", overflowX: "hidden" }}>
      {attachmentsModal}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontWeight: 600, fontSize: 16 }}>
          {isEditing ? "Edit work order" : "New work order"}
        </div>
        <Space wrap>
          <Button onClick={() => setAttachmentsOpen(true)}>
            Attachments{attachmentFiles.length ? ` (${attachmentFiles.length})` : ""}
          </Button>
          {onCancel ? <Button onClick={onCancel}>Clear</Button> : null}
          {isEditing && initial && onDelete ? (
            <Button danger onClick={() => onDelete(initial)}>
              Delete
            </Button>
          ) : null}
        </Space>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden", paddingRight: 4, maxWidth: "100%" }}>
        <Tabs
          defaultActiveKey="general"
          tabBarGutter={isMobileViewport ? 8 : 16}
          style={{ width: "100%", maxWidth: "100%", overflowX: "hidden" }}
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
                      showTime={{ format: APP_TIME_FORMAT }}
                      format={APP_DATE_TIME_FORMAT}
                      placeholder="Scheduled start"
                      value={toDayjsValue(draft.scheduledStartAt)}
                      onChange={(value) => updateDraft({ scheduledStartAt: toIsoDateTimeValue(value) })}
                    />
                  </LabeledField>
                  <LabeledField label="Scheduled end">
                    <DatePicker
                      showTime={{ format: APP_TIME_FORMAT }}
                      format={APP_DATE_TIME_FORMAT}
                      placeholder="Scheduled end"
                      value={toDayjsValue(draft.scheduledEndAt)}
                      onChange={(value) => updateDraft({ scheduledEndAt: toIsoDateTimeValue(value) })}
                    />
                  </LabeledField>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
                  <LabeledField label="Due at">
                    <DatePicker
                      showTime={{ format: APP_TIME_FORMAT }}
                      format={APP_DATE_TIME_FORMAT}
                      placeholder="Due at"
                      value={toDayjsValue(draft.dueAt)}
                      onChange={(value) => updateDraft({ dueAt: toIsoDateTimeValue(value) })}
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
                        showTime={{ format: APP_TIME_FORMAT }}
                        format={APP_DATE_TIME_FORMAT}
                        placeholder="Completed at"
                        value={toDayjsValue(draft.completedAt)}
                        onChange={(value) => updateDraft({ completedAt: toIsoDateTimeValue(value) })}
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
                    <LabeledField label="Worker" style={{ width: 260 }}>
                      <Select
                        placeholder="Select team member"
                        value={line.userUid || undefined}
                        showSearch
                        allowClear
                        optionFilterProp="label"
                        options={workerOptions}
                        onChange={(value) => updateWorker(idx, { userUid: value ?? "" })}
                        filterOption={(input, option) =>
                          String(option?.label ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
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
                      <div
                        key={`service-${idx}`}
                        style={{
                          width: "100%",
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                          paddingBottom: 10,
                          borderBottom: "1px solid var(--color-border)",
                        }}
                      >
                        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 90px", gap: 10 }}>
                          <LabeledField label="Service" style={{ minWidth: 0 }}>
                            <Select
                              placeholder="Select service"
                              value={line.serviceId || undefined}
                              showSearch
                              allowClear
                              optionFilterProp="label"
                              options={serviceOptions}
                              onChange={(value) => {
                                if (!value) {
                                  updateServiceLine(idx, { serviceId: "" });
                                  return;
                                }

                                const selectedService = (services ?? []).find((service) => service.id === value);
                                updateServiceLine(idx, {
                                  serviceId: value,
                                  unitPriceCents: line.unitPriceCents ?? selectedService?.priceCents ?? undefined,
                                });
                              }}
                              filterOption={(input, option) =>
                                String(option?.label ?? "")
                                  .toLowerCase()
                                  .includes(input.toLowerCase())
                              }
                              style={{ width: "100%" }}
                            />
                          </LabeledField>
                          <LabeledField label="Qty">
                            <InputNumber
                              min={1}
                              placeholder="Qty"
                              value={line.quantity}
                              onChange={(value) => updateServiceLine(idx, { quantity: value ?? undefined })}
                              style={{ width: "100%" }}
                            />
                          </LabeledField>
                        </div>

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "140px minmax(0, 1fr) auto",
                            gap: 10,
                            alignItems: "end",
                          }}
                        >
                          <LabeledField label="Unit price (cents)">
                            <InputNumber
                              min={0}
                              placeholder="Unit price"
                              value={line.unitPriceCents}
                              onChange={(value) =>
                                updateServiceLine(idx, { unitPriceCents: value ?? undefined })
                              }
                              style={{ width: "100%" }}
                            />
                          </LabeledField>
                          <LabeledField label="Notes" style={{ minWidth: 0 }}>
                            <Input
                              placeholder="Notes"
                              value={line.notes ?? ""}
                              onChange={(e) => updateServiceLine(idx, { notes: e.target.value })}
                              style={{ width: "100%" }}
                            />
                          </LabeledField>
                          <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <Button danger onClick={() => removeServiceLine(idx)}>
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
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

                    {(draft.inventoryLines ?? []).map((line, idx) => {
                      const selectedInventoryItem = inventoryById.get(line.inventoryItemId);
                      const availableQuantity = Math.max(
                        0,
                        Number(selectedInventoryItem?.quantity ?? 0)
                      );
                      const plannedQuantity = Math.max(0, Number(line.plannedQuantity ?? 0));
                      const consumedQuantity = Math.max(0, Number(line.consumedQuantity ?? 0));
                      const direction = line.direction ?? "output";
                      const exceedsAvailable =
                        direction === "output" &&
                        Math.max(plannedQuantity, consumedQuantity) > availableQuantity;

                      return (
                        <Space key={`inventory-${idx}`} wrap style={{ width: "100%" }} align="start">
                        <LabeledField label="Inventory item" style={{ width: 220 }}>
                          <Select
                            placeholder="Select inventory item"
                            value={line.inventoryItemId || undefined}
                            showSearch
                            allowClear
                            optionFilterProp="label"
                            options={inventoryItemOptions}
                            onChange={(value) => updateInventoryLine(idx, { inventoryItemId: value ?? "" })}
                            filterOption={(input, option) =>
                              String(option?.label ?? "")
                                .toLowerCase()
                                .includes(input.toLowerCase())
                            }
                            style={{ width: "100%" }}
                          />
                          {line.inventoryItemId ? (
                            <div style={{ marginTop: 4, fontSize: 12 }}>
                              <Typography.Text
                                type={exceedsAvailable ? "danger" : "secondary"}
                              >
                                Available: {availableQuantity}
                                {exceedsAvailable
                                  ? " - planned/consumed quantity exceeds stock"
                                  : ""}
                              </Typography.Text>
                            </div>
                          ) : null}
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
                      );
                    })}
                  </>
                )}
              </div>
            ),
          },
          {
            key: "activity",
            label: "Activity",
            children: activityContent,
          },
          ]}
        />
      </div>

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
