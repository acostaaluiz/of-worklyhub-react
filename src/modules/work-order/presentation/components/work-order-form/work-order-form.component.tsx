import React from "react";
import {
  Tag,
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
  Popover,
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
import dayjs from "dayjs";
import {
  AppstoreOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  CodeOutlined,
  DollarCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
  FlagOutlined,
  IdcardOutlined,
  InboxOutlined,
  InfoCircleOutlined,
  MessageOutlined,
  NumberOutlined,
  PaperClipOutlined,
  PlusOutlined,
  ReloadOutlined,
  SaveOutlined,
  ScheduleOutlined,
  SettingOutlined,
  TeamOutlined,
  ToolOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from "@ant-design/icons";

import type {
  CreateWorkOrderInput,
  UpdateWorkOrderInput,
  WorkOrder,
  WorkOrderAttachment,
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
  createWorkOrderAttachment,
  createWorkOrderComment,
  deleteWorkOrderAttachment,
  deleteWorkOrderChecklistItem,
  listWorkOrderAttachments,
  listWorkOrderChecklist,
  listWorkOrderComments,
  listWorkOrderHistory,
  requestWorkOrderAttachmentUploadSignature,
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
  icon?: React.ReactNode;
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
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontSize: 12,
  fontWeight: 600,
  color: "var(--color-text-muted)",
  lineHeight: 1.1,
};

function LabeledField({ label, icon, children, style }: LabeledFieldProps) {
  return (
    <div style={{ ...fieldContainerStyle, ...style }}>
      <span style={fieldLabelStyle}>
        {icon}
        {label}
      </span>
      {children}
    </div>
  );
}

function formatDateTime(value?: string | null): string {
  return formatAppDateTime(value, "--");
}

function formatAttachmentSize(sizeBytes?: number | null): string {
  if (typeof sizeBytes !== "number" || !Number.isFinite(sizeBytes) || sizeBytes < 0) {
    return "";
  }
  return `${(sizeBytes / 1024 / 1024).toFixed(2)} MB`;
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
  const [attachments, setAttachments] = React.useState<WorkOrderAttachment[]>([]);
  const [attachmentsLoading, setAttachmentsLoading] = React.useState(false);
  const [attachmentsUploading, setAttachmentsUploading] = React.useState(0);
  const [attachmentBusyId, setAttachmentBusyId] = React.useState<string | null>(null);
  const workOrderId = initial?.id ?? null;
  const isEditing = Boolean(workOrderId);
  const canManageActivity = Boolean(workspaceId && workOrderId);
  const activityUpdatedAt = initial?.updatedAt ?? "";
  const financeEntryId = initial?.financeEntryId ?? null;
  const hasFinanceEntry = Boolean(financeEntryId);
  const selectedStatus = React.useMemo(
    () => statuses.find((status) => status.id === draft.statusId) ?? initial?.status ?? null,
    [statuses, draft.statusId, initial?.status]
  );
  const isFinalStatus = React.useMemo(() => {
    if (!selectedStatus) return false;
    if (selectedStatus.isTerminal) return true;
    const code = selectedStatus.code?.toLowerCase() ?? "";
    return (
      code.includes("complete") ||
      code.includes("done") ||
      code.includes("finish") ||
      code.includes("close")
    );
  }, [selectedStatus]);
  const expectedAutomation = isEditing && isFinalStatus;
  const automationTag = hasFinanceEntry
    ? {
        color: "success" as const,
        label: "Finance entry linked",
      }
    : expectedAutomation
      ? {
          color: "warning" as const,
          label: "Pending financial launch",
        }
      : {
          color: "processing" as const,
          label: "Will launch on completion",
        };
  const automationSummary = hasFinanceEntry
    ? "Execution completion already generated a financial entry."
    : expectedAutomation
      ? "This work order is in a final status and should create finance entry automatically."
      : "Finance entry is automatically created when the work order reaches a final execution status.";
  const isDevEnvironment = import.meta.env.MODE !== "production";
  const automationNfeNote = isDevEnvironment
    ? "NF-e trigger is optional and in development it may fail when GOV endpoints are unavailable."
    : "NF-e trigger is optional and depends on billing configuration.";
  const openPath = React.useCallback((path: string) => {
    if (typeof window === "undefined") return;
    window.location.assign(path);
  }, []);

  const openAttachmentPreview = React.useCallback((attachment: WorkOrderAttachment) => {
    if (!attachment.downloadUrl) {
      message.info("Attachment URL expired. Refresh activity and try again.");
      return;
    }
    window.open(attachment.downloadUrl, "_blank", "noopener,noreferrer");
  }, []);

  const handleAttachmentBeforeUpload = React.useCallback<NonNullable<UploadProps["beforeUpload"]>>(
    async (file) => {
      const fileSizeMb = file.size / (1024 * 1024);
      if (fileSizeMb > maxAttachmentSizeMb) {
        message.error(`File "${file.name}" exceeds ${maxAttachmentSizeMb} MB.`);
        return Upload.LIST_IGNORE;
      }
      if (!workspaceId || !workOrderId) {
        message.info("Save the work order before uploading attachments.");
        return Upload.LIST_IGNORE;
      }

      const contentType = file.type?.trim() ? file.type : "application/octet-stream";
      const maxSizeBytes = maxAttachmentSizeMb * 1024 * 1024;

      setAttachmentsUploading((prev) => prev + 1);
      try {
        const signature = await requestWorkOrderAttachmentUploadSignature(workspaceId, workOrderId, {
          filename: file.name,
          contentType,
          maxSize: maxSizeBytes,
          userUid: currentUserUid ?? undefined,
        });

        const uploadResponse = await fetch(signature.url, {
          method: "PUT",
          headers: {
            "Content-Type": contentType,
          },
          body: file as File,
        });

        if (!uploadResponse.ok) {
          throw new Error(`upload_failed_${uploadResponse.status}`);
        }

        await createWorkOrderAttachment(workspaceId, workOrderId, {
          storagePath: signature.path,
          fileName: file.name,
          contentType,
          sizeBytes: file.size,
          authorUid: currentUserUid ?? undefined,
        });

        const updated = await listWorkOrderAttachments(workspaceId, workOrderId);
        setAttachments(updated ?? []);
        message.success(`Attachment "${file.name}" uploaded.`);
      } catch {
        message.error(`Failed to upload "${file.name}".`);
      } finally {
        setAttachmentsUploading((prev) => Math.max(0, prev - 1));
      }

      return Upload.LIST_IGNORE;
    },
    [workspaceId, workOrderId, currentUserUid]
  );

  React.useEffect(() => {
    if (initial) {
      setDraft(mapFromInitial(initial));
      setMetadataText(JSON.stringify(initial.metadata ?? {}, null, 2));
      setAttachments([]);
      setAttachmentsOpen(false);
      return;
    }

    setDraft(buildEmptyDraft(workspaceId, currentUserUid));
    setMetadataText("{}");
    setAttachments([]);
    setAttachmentsOpen(false);
  }, [initial, workspaceId, currentUserUid]);

  React.useEffect(() => {
    if (draft.statusId || statuses.length === 0) return;
    setDraft((prev) => ({ ...prev, statusId: statuses[0]?.id }));
  }, [draft.statusId, statuses]);

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
    setAttachmentsLoading(true);
    try {
      const [historyRows, commentRows, checklistRows, attachmentRows] = await Promise.all([
        listWorkOrderHistory(workspaceId, workOrderId),
        listWorkOrderComments(workspaceId, workOrderId),
        listWorkOrderChecklist(workspaceId, workOrderId),
        listWorkOrderAttachments(workspaceId, workOrderId),
      ]);
      setHistory(historyRows ?? []);
      setComments(commentRows ?? []);
      setChecklist(checklistRows ?? []);
      setAttachments(attachmentRows ?? []);
    } catch (err) {
      message.error("Failed to load work order activity.");
    } finally {
      setActivityLoading(false);
      setAttachmentsLoading(false);
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
      setAttachments([]);
      setAttachmentBusyId(null);
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

  const handleDeleteAttachment = async (attachment: WorkOrderAttachment) => {
    if (!workspaceId || !workOrderId) return;
    setAttachmentBusyId(attachment.id);
    try {
      await deleteWorkOrderAttachment(workspaceId, workOrderId, attachment.id);
      setAttachments((prev) => prev.filter((row) => row.id !== attachment.id));
      message.success("Attachment removed.");
    } catch {
      message.error("Failed to remove attachment.");
    } finally {
      setAttachmentBusyId(null);
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
        <div style={{ fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
          <ScheduleOutlined />
          Activity
        </div>
        <Button size="small" icon={<ReloadOutlined />} onClick={loadActivity} loading={activityLoading}>
          Refresh
        </Button>
      </div>

      <Tabs
        size="small"
        items={[
          {
            key: "activity-history",
            label: (
              <Space size={6}>
                <ClockCircleOutlined />
                History
              </Space>
            ),
            children: activityLoading ? (
              <div style={{ color: "var(--color-text-muted)" }}>Loading history...</div>
            ) : sortedHistory.length === 0 ? (
              <div style={{ color: "var(--color-text-muted)" }}>No status history yet.</div>
            ) : (
              <Timeline
                items={sortedHistory.map((entry) => {
                  const previous = entry.previousStatus?.label ?? "--";
                  const next = entry.newStatus?.label ?? "--";
                  const changedBy = entry.changedBy ? resolveEmployeeLabel(entry.changedBy) : "System";
                  const title = entry.previousStatus ? `${previous} -> ${next}` : `${next}`;
                  return {
                    children: (
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <div style={{ fontWeight: 600 }}>{title}</div>
                        <div style={{ color: "var(--color-text-muted)", fontSize: 12 }}>
                          {formatDateTime(entry.changedAt)} | {changedBy}
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
            label: (
              <Space size={6}>
                <MessageOutlined />
                Comments
              </Space>
            ),
            children: (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <LabeledField label="New comment" icon={<MessageOutlined />}>
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
                    icon={<MessageOutlined />}
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
            label: (
              <Space size={6}>
                <UnorderedListOutlined />
                Checklist
              </Space>
            ),
            children: (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>
                  <LabeledField label="Title" icon={<UnorderedListOutlined />} style={{ flex: 1, minWidth: 220 }}>
                    <Input
                      placeholder="Checklist item"
                      value={checklistTitle}
                      onChange={(e) => setChecklistTitle(e.target.value)}
                    />
                  </LabeledField>
                  <LabeledField label="Sort order" icon={<NumberOutlined />} style={{ width: 140 }}>
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
                    icon={<PlusOutlined />}
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
                              icon={<SaveOutlined />}
                              onClick={handleSaveEditChecklist}
                              loading={isBusy}
                            >
                              Save
                            </Button>,
                            <Button
                              key="cancel"
                              size="small"
                              icon={<CloseOutlined />}
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
                            icon={<EditOutlined />}
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
                            <Button danger size="small" icon={<DeleteOutlined />} disabled={isBusy}>
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
                            Order: {item.sortOrder} | {completionLabel}
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

  const isAttachmentUploadRunning = attachmentsUploading > 0;

  const attachmentsModal = (
    <Modal
      title={
        <Space size={8}>
          <PaperClipOutlined />
          {"Attachments (" + attachments.length + ")"}
        </Space>
      }
      open={attachmentsOpen}
      onCancel={() => setAttachmentsOpen(false)}
      footer={[
        <Button key="cancel" icon={<CloseOutlined />} onClick={() => setAttachmentsOpen(false)}>
          Cancel
        </Button>,
      ]}
      width={760}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ color: "var(--color-text-muted)", fontSize: 12 }}>
          {canManageActivity
            ? "Files are stored in Firebase and linked to this work order."
            : "Save the work order first to enable attachments."}
        </div>

        <Upload.Dragger
          multiple
          accept={attachmentAccept}
          beforeUpload={handleAttachmentBeforeUpload}
          showUploadList={false}
          disabled={!canManageActivity}
        >
          <InboxOutlined style={{ fontSize: 28, color: "var(--color-text-muted)", marginBottom: 8 }} />
          <p style={{ marginBottom: 8, fontWeight: 600 }}>Click or drag files to attach</p>
          <p style={{ margin: 0, color: "var(--color-text-muted)" }}>
            Photos and documents up to {maxAttachmentSizeMb} MB per file.
          </p>
        </Upload.Dragger>

        {isAttachmentUploadRunning ? (
          <div style={{ color: "var(--color-text-muted)", fontSize: 12 }}>
            Uploading {attachmentsUploading} file{attachmentsUploading > 1 ? "s" : ""}...
          </div>
        ) : null}

        <Divider style={{ margin: "4px 0" }} />

        <div style={{ fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
          <PaperClipOutlined />
          Attached files
        </div>
        <List
          loading={attachmentsLoading}
          dataSource={attachments}
          locale={{ emptyText: "No attachments yet." }}
          renderItem={(attachment) => {
            const fileSize = formatAttachmentSize(attachment.sizeBytes);
            const createdBy = attachment.authorUid
              ? resolveEmployeeLabel(attachment.authorUid)
              : "System";
            const isBusy = attachmentBusyId === attachment.id;

            return (
              <List.Item
                actions={[
                  <Button
                    key={"view-" + attachment.id}
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => openAttachmentPreview(attachment)}
                    disabled={!attachment.downloadUrl || isBusy}
                  >
                    View
                  </Button>,
                  <Popconfirm
                    key={"remove-" + attachment.id}
                    title="Remove attachment?"
                    okText="Remove"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => handleDeleteAttachment(attachment)}
                  >
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      disabled={isBusy || isAttachmentUploadRunning}
                    >
                      Remove
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <div style={{ fontWeight: 500 }}>{attachment.fileName}</div>
                  <div style={{ color: "var(--color-text-muted)", fontSize: 12 }}>
                    {attachment.contentType || "application/octet-stream"}
                    {fileSize ? " | " + fileSize : ""}
                    {" | " + formatDateTime(attachment.createdAt)}
                    {" | " + createdBy}
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
        <div style={{ fontWeight: 600, fontSize: 16, display: "inline-flex", alignItems: "center", gap: 8 }}>
          <AppstoreOutlined />
          {isEditing ? "Edit work order" : "New work order"}
        </div>
        <Space wrap>
          <Button icon={<PaperClipOutlined />} onClick={() => setAttachmentsOpen(true)}>
            Attachments{attachments.length ? ` (${attachments.length})` : ""}
          </Button>
          <Button icon={<DollarCircleOutlined />} onClick={() => openPath("/finance/entries")}>
            Finance entries
          </Button>
          <Button icon={<SettingOutlined />} onClick={() => openPath("/settings")}>
            Billing settings
          </Button>
          {onCancel ? <Button icon={<CloseOutlined />} onClick={onCancel}>Clear</Button> : null}
          {isEditing && initial && onDelete ? (
            <Button danger icon={<DeleteOutlined />} onClick={() => onDelete(initial)}>
              Delete
            </Button>
          ) : null}
        </Space>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: -2 }}>
        <Tag color={automationTag.color} icon={<DollarCircleOutlined />}>
          {automationTag.label}
        </Tag>
        {financeEntryId ? (
          <Tag color="blue">{`Entry: ${financeEntryId.slice(0, 10)}${financeEntryId.length > 10 ? "..." : ""}`}</Tag>
        ) : null}
        {isFinalStatus && !hasFinanceEntry ? (
          <Tag color="orange" icon={<InfoCircleOutlined />}>
            Review finance queue
          </Tag>
        ) : null}
        <Popover
          placement="bottomLeft"
          title="Finance automation"
          trigger={["hover", "click"]}
          content={
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 320 }}>
              <Typography.Text style={{ fontSize: 12 }}>{automationSummary}</Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {automationNfeNote}
              </Typography.Text>
              <Space wrap size={6}>
                <Button size="small" icon={<DollarCircleOutlined />} onClick={() => openPath("/finance/entries")}>
                  Finance entries
                </Button>
                <Button size="small" icon={<SettingOutlined />} onClick={() => openPath("/settings")}>
                  Billing settings
                </Button>
              </Space>
            </div>
          }
        >
          <Button size="small" type="text" icon={<InfoCircleOutlined />}>
            Details
          </Button>
        </Popover>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden", paddingRight: 4, maxWidth: "100%" }}>
        <Tabs
          defaultActiveKey="general"
          tabBarGutter={isMobileViewport ? 8 : 16}
          style={{ width: "100%", maxWidth: "100%", overflowX: "hidden" }}
          items={[
          {
            key: "general",
            label: (
              <Space size={6}>
                <FileTextOutlined />
                General
              </Space>
            ),
            children: (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <LabeledField label="Title" icon={<FileTextOutlined />}>
                  <Input
                    placeholder="Title"
                    value={draft.title}
                    onChange={(e) => updateDraft({ title: e.target.value })}
                  />
                </LabeledField>
                <LabeledField label="Description" icon={<MessageOutlined />}>
                  <Input.TextArea
                    placeholder="Description"
                    value={draft.description ?? ""}
                    onChange={(e) => updateDraft({ description: e.target.value })}
                    rows={3}
                  />
                </LabeledField>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
                  <LabeledField label="Priority" icon={<FlagOutlined />}>
                    <Select
                      placeholder="Priority"
                      value={draft.priority}
                      options={priorityOptions}
                      onChange={(value) => updateDraft({ priority: value })}
                    />
                  </LabeledField>
                  <LabeledField label="Status" icon={<InfoCircleOutlined />}>
                    <Select
                      placeholder="Status"
                      value={draft.statusId}
                      options={statuses.map((s) => ({ value: s.id, label: s.label }))}
                      onChange={(value) => updateDraft({ statusId: value })}
                    />
                  </LabeledField>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
                  <LabeledField label="Requester" icon={<UserOutlined />}>
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
                  <LabeledField label="Created by" icon={<IdcardOutlined />}>
                    <Input
                      placeholder="Created by"
                      value={resolveEmployeeLabel(draft.createdBy ?? currentUserUid)}
                      disabled
                    />
                  </LabeledField>
                </div>

                <LabeledField label="Metadata (JSON)" icon={<CodeOutlined />}>
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
            label: (
              <Space size={6}>
                <CalendarOutlined />
                Schedule
              </Space>
            ),
            children: (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
                  <LabeledField label="Scheduled start" icon={<CalendarOutlined />}>
                    <DatePicker
                      showTime={{ format: APP_TIME_FORMAT }}
                      format={APP_DATE_TIME_FORMAT}
                      placeholder="Scheduled start"
                      value={toDayjsValue(draft.scheduledStartAt)}
                      onChange={(value) => updateDraft({ scheduledStartAt: toIsoDateTimeValue(value) })}
                    />
                  </LabeledField>
                  <LabeledField label="Scheduled end" icon={<CalendarOutlined />}>
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
                  <LabeledField label="Due at" icon={<CalendarOutlined />}>
                    <DatePicker
                      showTime={{ format: APP_TIME_FORMAT }}
                      format={APP_DATE_TIME_FORMAT}
                      placeholder="Due at"
                      value={toDayjsValue(draft.dueAt)}
                      onChange={(value) => updateDraft({ dueAt: toIsoDateTimeValue(value) })}
                    />
                  </LabeledField>
                  <LabeledField label="Estimated duration (min)" icon={<ClockCircleOutlined />}>
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
                    <LabeledField label="Actual duration (min)" icon={<ClockCircleOutlined />}>
                      <InputNumber
                        min={0}
                        placeholder="Actual duration (min)"
                        value={draft.actualDurationMinutes ?? undefined}
                        onChange={(value) => updateDraft({ actualDurationMinutes: value ?? null })}
                        style={{ width: "100%" }}
                      />
                    </LabeledField>
                    <LabeledField label="Completed at" icon={<CalendarOutlined />}>
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
            label: (
              <Space size={6}>
                <TeamOutlined />
                Team
              </Space>
            ),
            children: (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 600 }}>Workers</div>
                  <Button icon={<PlusOutlined />} onClick={addWorker}>Add worker</Button>
                </div>

                {(draft.workers ?? []).length === 0 ? (
                  <div style={{ color: "var(--color-text-muted)" }}>No workers assigned.</div>
                ) : null}

                {(draft.workers ?? []).map((line, idx) => (
                  <Space key={`worker-${idx}`} wrap style={{ width: "100%" }} align="start">
                    <LabeledField label="Worker" icon={<UserOutlined />} style={{ width: 260 }}>
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
                    <LabeledField label="Role" icon={<IdcardOutlined />} style={{ width: 170 }}>
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
                    <LabeledField label="Allocated minutes" icon={<ClockCircleOutlined />} style={{ width: 150 }}>
                      <InputNumber
                        min={0}
                        placeholder="Minutes"
                        value={line.allocatedMinutes}
                        onChange={(value) => updateWorker(idx, { allocatedMinutes: value ?? undefined })}
                        style={{ width: "100%" }}
                      />
                    </LabeledField>
                    <div style={{ display: "flex", alignItems: "flex-end", minHeight: "100%" }}>
                      <Button danger icon={<DeleteOutlined />} onClick={() => removeWorker(idx)}>
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
            label: (
              <Space size={6}>
                <UnorderedListOutlined />
                Lines
              </Space>
            ),
            children: (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <LabeledField label="Line type" icon={<AppstoreOutlined />}>
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
                      <Button icon={<PlusOutlined />} onClick={addServiceLine}>Add service</Button>
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
                          <LabeledField label="Service" icon={<ToolOutlined />} style={{ minWidth: 0 }}>
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
                          <LabeledField label="Qty" icon={<NumberOutlined />}>
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
                          <LabeledField label="Unit price (cents)" icon={<NumberOutlined />}>
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
                          <LabeledField label="Notes" icon={<FileTextOutlined />} style={{ minWidth: 0 }}>
                            <Input
                              placeholder="Notes"
                              value={line.notes ?? ""}
                              onChange={(e) => updateServiceLine(idx, { notes: e.target.value })}
                              style={{ width: "100%" }}
                            />
                          </LabeledField>
                          <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <Button danger icon={<DeleteOutlined />} onClick={() => removeServiceLine(idx)}>
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
                      <Button icon={<PlusOutlined />} onClick={addInventoryLine}>Add item</Button>
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
                        <LabeledField label="Inventory item" icon={<InboxOutlined />} style={{ width: 220 }}>
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
                        <LabeledField label="Direction" icon={<ScheduleOutlined />} style={{ width: 130 }}>
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
                        <LabeledField label="Planned quantity" icon={<NumberOutlined />} style={{ width: 120 }}>
                          <InputNumber
                            min={0}
                            placeholder="Planned"
                            value={line.plannedQuantity}
                            onChange={(value) => updateInventoryLine(idx, { plannedQuantity: value ?? undefined })}
                            style={{ width: "100%" }}
                          />
                        </LabeledField>
                        <LabeledField label="Consumed quantity" icon={<NumberOutlined />} style={{ width: 120 }}>
                          <InputNumber
                            min={0}
                            placeholder="Consumed"
                            value={line.consumedQuantity}
                            onChange={(value) => updateInventoryLine(idx, { consumedQuantity: value ?? undefined })}
                            style={{ width: "100%" }}
                          />
                        </LabeledField>
                        <LabeledField label="Unit cost (cents)" icon={<NumberOutlined />} style={{ width: 170 }}>
                          <InputNumber
                            min={0}
                            placeholder="Unit cost (cents)"
                            value={line.unitCostCents}
                            onChange={(value) => updateInventoryLine(idx, { unitCostCents: value ?? undefined })}
                            style={{ width: "100%" }}
                          />
                        </LabeledField>
                        <div style={{ display: "flex", alignItems: "flex-end", minHeight: "100%" }}>
                          <Button danger icon={<DeleteOutlined />} onClick={() => removeInventoryLine(idx)}>
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
            label: (
              <Space size={6}>
                <ScheduleOutlined />
                Activity
              </Space>
            ),
            children: activityContent,
          },
          ]}
        />
      </div>

      <Divider style={{ margin: "0" }} />

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          type="primary"
          icon={isEditing ? <SaveOutlined /> : <PlusOutlined />}
          loading={loading}
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          {isEditing ? "Save changes" : "Create work order"}
        </Button>
      </div>
    </div>
  );
}

export default WorkOrderForm;
