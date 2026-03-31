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
  Popconfirm,
  Popover,
  Select,
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
  FileTextOutlined,
  FlagOutlined,
  IdcardOutlined,
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
  UnorderedListOutlined,
  UserOutlined,
} from "@ant-design/icons";

import type {
  CreateWorkOrderInput,
  UpdateWorkOrderInput,
  WorkOrderAttachment,
  WorkOrderChecklistItem,
  WorkOrderComment,
  WorkOrderInventoryLineInput,
  WorkOrderServiceLineInput,
  WorkOrderStatusHistoryEntry,
  WorkOrderWorkerInput,
} from "@modules/work-order/interfaces/work-order.model";
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
  toDayjsValue,
  toIsoDateTimeValue,
} from "@core/utils/date-time";
import { getMoneyMaskAdapter } from "@core/utils/mask";
import {
  attachmentAccept,
  buildWorkOrderAutomationView,
  buildEmptyDraft,
  formatDateTime,
  mapFromInitial,
  maxAttachmentSizeMb,
  priorityValues,
  type WorkOrderFormProps,
  type WorkOrderDraft,
} from "./work-order-form.helpers";
import { LabeledField } from "./work-order-form-labeled-field.component";
import WorkOrderFormAttachmentsModal from "./work-order-form-attachments-modal.component";
import WorkOrderFormTeamTab from "./work-order-form-team-tab.component";
import WorkOrderFormLinesTab from "./work-order-form-lines-tab.component";

import {
  DEFAULT_ATTACHMENT_HOST_SUFFIXES,
  resolveTrustedExternalHosts,
  toSafeAppPath,
  toSafeExternalUrl,
} from "@core/navigation/safe-navigation";
import { i18n as appI18n } from "@core/i18n";
const moneyMaskCents = getMoneyMaskAdapter({ fromCents: true });

type Props = WorkOrderFormProps;

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
  const isMobileViewport = typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches;

  const [draft, setDraft] = React.useState<WorkOrderDraft>(() =>
    initial ? mapFromInitial(initial) : buildEmptyDraft(workspaceId, currentUserUid)
  );
  const [metadataText, setMetadataText] = React.useState<string>(() => {
    if (initial?.metadata) return JSON.stringify(initial.metadata, null, 2);
    return "{}";
  });
  const [activeTabKey, setActiveTabKey] = React.useState("general");
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
  const isDevEnvironment = import.meta.env.MODE !== "production";
  const { automationTag, automationSummary, automationNfeNote } =
    buildWorkOrderAutomationView({
      hasFinanceEntry,
      expectedAutomation,
      isDevEnvironment,
      t: (key) => appI18n.t(key),
    });
  const trustedAttachmentHosts = React.useMemo(() => resolveTrustedExternalHosts({
    envKeys: ["VITE_ALLOWED_ATTACHMENT_HOSTS", "VITE_ALLOWED_EXTERNAL_HOSTS"],
    includeApiBaseUrlHost: true,
    includeWindowHost: true,
  }), []);
  const openPath = React.useCallback((path: string) => {
    if (typeof window === "undefined") return;
    const safePath = toSafeAppPath(path);
    if (!safePath) {
      message.error(appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k009"));
      return;
    }
    window.location.assign(safePath);
  }, []);

  const openAttachmentPreview = React.useCallback((attachment: WorkOrderAttachment) => {
    if (!attachment.downloadUrl) {
      message.info(appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k010"));
      return;
    }
    const rawUrl = attachment.downloadUrl.trim();
    const candidateUrl = rawUrl.startsWith("/") && typeof window !== "undefined" ? `${window.location.origin}${rawUrl}` : rawUrl;
    const safeDownloadUrl = toSafeExternalUrl(candidateUrl, {
      allowedHosts: trustedAttachmentHosts,
      allowedHostSuffixes: DEFAULT_ATTACHMENT_HOST_SUFFIXES,
    });
    if (!safeDownloadUrl) {
      message.error(appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k011"));
      return;
    }
    window.open(safeDownloadUrl, "_blank", "noopener,noreferrer");
  }, [trustedAttachmentHosts]);

  const handleAttachmentBeforeUpload = React.useCallback<NonNullable<UploadProps["beforeUpload"]>>(
    async (file) => {
      const fileSizeMb = file.size / (1024 * 1024);
      if (fileSizeMb > maxAttachmentSizeMb) {
        message.error(
          appI18n.t(
            "legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.attachmentFileTooLarge",
            { fileName: file.name, maxAttachmentSizeMb }
          )
        );
        return Upload.LIST_IGNORE;
      }
      if (!workspaceId || !workOrderId) {
        message.info(appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k012"));
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
        message.success(
          appI18n.t(
            "legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.attachmentUploaded",
            { fileName: file.name }
          )
        );
      } catch {
        message.error(
          appI18n.t(
            "legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.attachmentUploadFailed",
            { fileName: file.name }
          )
        );
      } finally {
        setAttachmentsUploading((prev) => Math.max(0, prev - 1));
      }

      return Upload.LIST_IGNORE;
    },
    [workspaceId, workOrderId, currentUserUid]
  );

  React.useEffect(() => {
    setActiveTabKey("general");
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
        message.error(appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k013"));
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
      message.error(appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k014"));
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
      message.info(appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k015"));
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
      message.success(appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k016"));
    } catch (err) {
      message.error(appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k017"));
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
      message.info(appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k018"));
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
      message.success(appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k019"));
    } catch (err) {
      message.error(appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k020"));
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
      message.error(appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k021"));
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
      message.success(appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k022"));
    } catch (err) {
      message.error(appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k023"));
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
      message.success(appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k024"));
    } catch (err) {
      message.error(appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k025"));
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
      message.success(appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k026"));
    } catch {
      message.error(appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k027"));
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
      description={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k028")}
      image={Empty.PRESENTED_IMAGE_SIMPLE}
    />
  ) : (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
          <ScheduleOutlined />
          {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k029")}
        </div>
        <Button size="small" icon={<ReloadOutlined />} onClick={loadActivity} loading={activityLoading}>
          {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k030")}
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
                {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k031")}
              </Space>
            ),
            children: activityLoading ? (
              <div style={{ color: "var(--color-text-muted)" }}>{appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k032")}</div>
            ) : sortedHistory.length === 0 ? (
              <div style={{ color: "var(--color-text-muted)" }}>{appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k033")}</div>
            ) : (
              <Timeline
                items={sortedHistory.map((entry) => {
                  const previous = entry.previousStatus?.label ?? "--";
                  const next = entry.newStatus?.label ?? "--";
                  const changedBy = entry.changedBy ? resolveEmployeeLabel(entry.changedBy) : appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k034");
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
                {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k035")}
              </Space>
            ),
            children: (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <LabeledField label={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k036")} icon={<MessageOutlined />}>
                  <Input.TextArea
                    placeholder={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k037")}
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
                    {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k038")}
                  </Button>
                </div>
                <Divider style={{ margin: "4px 0" }} />
                <List
                  loading={activityLoading}
                  dataSource={sortedComments}
                  locale={{ emptyText: appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k039") }}
                  renderItem={(comment) => {
                    const author = comment.authorUid
                      ? resolveEmployeeLabel(comment.authorUid)
                      : appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k040");
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
                {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k041")}
              </Space>
            ),
            children: (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>
                  <LabeledField label={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k042")} icon={<UnorderedListOutlined />} style={{ flex: 1, minWidth: 220 }}>
                    <Input
                      placeholder={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k043")}
                      value={checklistTitle}
                      onChange={(e) => setChecklistTitle(e.target.value)}
                    />
                  </LabeledField>
                  <LabeledField label={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k044")} icon={<NumberOutlined />} style={{ width: 140 }}>
                    <InputNumber
                      min={0}
                      placeholder={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k045")}
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
                    {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k046")}
                  </Button>
                </div>

                <List
                  loading={activityLoading}
                  dataSource={sortedChecklist}
                  locale={{ emptyText: appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k047") }}
                  renderItem={(item) => {
                    const isEditingItem = checklistEditingId === item.id;
                    const isBusy = checklistBusyId === item.id;
                    const completedBy = item.completedBy ? resolveEmployeeLabel(item.completedBy) : "";
                    const completionLabel = item.isDone
                      ? `Completed ${formatDateTime(item.completedAt)}${completedBy ? ` by ${completedBy}` : ""}`
                      : appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k048");

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
                              {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k049")}
                            </Button>,
                            <Button
                              key="cancel"
                              size="small"
                              icon={<CloseOutlined />}
                              onClick={handleCancelEditChecklist}
                              disabled={isBusy}
                            >
                              {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k050")}
                            </Button>,
                          ]}
                        >
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, width: "100%" }}>
                            <Input
                              placeholder={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k051")}
                              value={checklistEditDraft.title}
                              onChange={(e) =>
                                setChecklistEditDraft((prev) => ({ ...prev, title: e.target.value }))
                              }
                              style={{ flex: 1, minWidth: 220 }}
                            />
                            <InputNumber
                              min={0}
                              placeholder={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k052")}
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
                            {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k053")}
                          </Button>,
                          <Popconfirm
                            key="delete"
                            title={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k054")}
                            okText={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k055")}
                            okButtonProps={{ danger: true }}
                            onConfirm={() => handleDeleteChecklistItem(item.id)}
                          >
                            <Button danger size="small" icon={<DeleteOutlined />} disabled={isBusy}>
                              {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k056")}
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
                            {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k057")}: {item.sortOrder} | {completionLabel}
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

  const shouldUseScrollablePane = activeTabKey !== "general";

  const handleMetadataChange = React.useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const nextValue = event.target.value;
      const isShrinking = nextValue.length <= metadataText.length;
      const fitsFixedHeight = event.target.scrollHeight <= event.target.clientHeight + 1;

      if (isShrinking || fitsFixedHeight) {
        setMetadataText(nextValue);
      }
    },
    [metadataText]
  );

  if (!workspaceId) {
    return (
      <Empty
        description={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k075")}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        height: "100%",
        minHeight: 0,
        maxWidth: "100%",
        overflowX: "hidden",
        borderRadius: "var(--radius-md)",
        border: "1px solid color-mix(in srgb, var(--color-primary) 18%, var(--color-border))",
        background:
          "linear-gradient(155deg, color-mix(in srgb, var(--color-surface) 90%, transparent), color-mix(in srgb, var(--color-surface-2) 72%, transparent))",
        boxShadow: "var(--shadow-sm)",
        padding: "12px",
      }}
      data-cy="work-order-form"
    >
      <WorkOrderFormAttachmentsModal
        open={attachmentsOpen}
        attachments={attachments}
        attachmentsLoading={attachmentsLoading}
        attachmentsUploading={attachmentsUploading}
        attachmentBusyId={attachmentBusyId}
        canManageActivity={canManageActivity}
        isAttachmentUploadRunning={isAttachmentUploadRunning}
        attachmentAccept={attachmentAccept}
        maxAttachmentSizeMb={maxAttachmentSizeMb}
        onClose={() => setAttachmentsOpen(false)}
        onBeforeUpload={handleAttachmentBeforeUpload}
        onOpenPreview={openAttachmentPreview}
        onDeleteAttachment={handleDeleteAttachment}
        resolveEmployeeLabel={resolveEmployeeLabel}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
          paddingBottom: 8,
          borderBottom: "1px solid var(--color-divider)",
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 16, display: "inline-flex", alignItems: "center", gap: 8 }}>
          <AppstoreOutlined />
          {isEditing ? appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k076") : appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k077")}
        </div>
        <Space
          wrap
          size={8}
          style={isMobileViewport ? { width: "100%" } : { paddingRight: 44 }}
        >
          <Button icon={<PaperClipOutlined />} onClick={() => setAttachmentsOpen(true)}>
            {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k078")}
            {attachments.length ? ` (${attachments.length})` : ""}
          </Button>
          <Button icon={<DollarCircleOutlined />} onClick={() => openPath("/finance/entries")}>
            {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k079")}
          </Button>
          <Button icon={<SettingOutlined />} onClick={() => openPath("/settings")}>
            {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k080")}
          </Button>
          {onCancel ? <Button icon={<CloseOutlined />} onClick={onCancel}>{appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k081")}</Button> : null}
          {isEditing && initial && onDelete ? (
            <Button danger icon={<DeleteOutlined />} onClick={() => onDelete(initial)}>
              {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k082")}
            </Button>
          ) : null}
        </Space>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <Tag color={automationTag.color} icon={<DollarCircleOutlined />}>
          {automationTag.label}
        </Tag>
        {financeEntryId ? (
          <Tag color="blue">
            {`${appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k083")}: ${financeEntryId.slice(0, 10)}${financeEntryId.length > 10 ? "..." : ""}`}
          </Tag>
        ) : null}
        {isFinalStatus && !hasFinanceEntry ? (
          <Tag color="orange" icon={<InfoCircleOutlined />}>
            {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k084")}
          </Tag>
        ) : null}
        <Popover
          placement="bottomLeft"
          title={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k085")}
          trigger={["hover", "click"]}
          content={
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 320 }}>
              <Typography.Text style={{ fontSize: 12 }}>{automationSummary}</Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {automationNfeNote}
              </Typography.Text>
              <Space wrap size={6}>
                <Button size="small" icon={<DollarCircleOutlined />} onClick={() => openPath("/finance/entries")}>
                  {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k086")}
                </Button>
                <Button size="small" icon={<SettingOutlined />} onClick={() => openPath("/settings")}>
                  {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k087")}
                </Button>
              </Space>
            </div>
          }
        >
          <Button size="small" type="text" icon={<InfoCircleOutlined />}>
            {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k088")}
          </Button>
        </Popover>
      </div>

      <div
        style={{
          minHeight: 0,
          maxHeight: shouldUseScrollablePane ? (isMobileViewport ? "48vh" : "44vh") : "none",
          overflowY: shouldUseScrollablePane ? "auto" : "visible",
          overflowX: "hidden",
          paddingRight: 4,
          maxWidth: "100%",
        }}
      >
        <Tabs
          data-cy="work-order-form-tabs"
          activeKey={activeTabKey}
          onChange={setActiveTabKey}
          tabBarGutter={isMobileViewport ? 8 : 16}
          style={{ width: "100%", maxWidth: "100%", overflowX: "hidden" }}
          items={[
          {
            key: "general",
            label: (
              <Space size={6} data-cy="work-order-tab-general">
                <FileTextOutlined />
                {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k089")}
              </Space>
            ),
            children: (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <LabeledField label={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k090")} icon={<FileTextOutlined />}>
                  <Input
                    placeholder={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k091")}
                    value={draft.title}
                    onChange={(e) => updateDraft({ title: e.target.value })}
                    data-cy="work-order-title-input"
                  />
                </LabeledField>
                <LabeledField label={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k092")} icon={<MessageOutlined />}>
                  <Input.TextArea
                    placeholder={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k093")}
                    value={draft.description ?? ""}
                    onChange={(e) => updateDraft({ description: e.target.value })}
                    rows={2}
                    data-cy="work-order-description-input"
                  />
                </LabeledField>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobileViewport ? "1fr" : "repeat(4, minmax(0, 1fr))",
                    gap: 10,
                  }}
                >
                  <LabeledField label={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k094")} icon={<FlagOutlined />}>
                    <Select
                      placeholder={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k095")}
                      value={draft.priority}
                      options={priorityValues.map((value) => ({
                        value,
                        label:
                          value === "low"
                            ? appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k096")
                            : value === "medium"
                              ? appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k097")
                              : value === "high"
                                ? appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k098")
                                : appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k099"),
                      }))}
                      onChange={(value) => updateDraft({ priority: value })}
                      data-cy="work-order-priority-select"
                    />
                  </LabeledField>
                  <LabeledField label={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k100")} icon={<InfoCircleOutlined />}>
                    <Select
                      placeholder={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k101")}
                      value={draft.statusId}
                      options={statuses.map((s) => ({ value: s.id, label: s.label }))}
                      onChange={(value) => updateDraft({ statusId: value })}
                      data-cy="work-order-status-select"
                    />
                  </LabeledField>
                  <LabeledField label={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k102")} icon={<UserOutlined />}>
                    <Select
                      placeholder={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k103")}
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
                      data-cy="work-order-requester-select"
                    />
                  </LabeledField>
                  <LabeledField label={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k104")} icon={<IdcardOutlined />}>
                    <Input
                      placeholder={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k105")}
                      value={resolveEmployeeLabel(draft.createdBy ?? currentUserUid)}
                      disabled
                      data-cy="work-order-created-by-input"
                    />
                  </LabeledField>
                </div>

                <LabeledField label={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k106")} icon={<CodeOutlined />}>
                  <Input.TextArea
                    placeholder={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k107")}
                    value={metadataText}
                    onChange={handleMetadataChange}
                    rows={4}
                    style={{
                      minHeight: 120,
                      maxHeight: 120,
                      height: 120,
                      overflow: "hidden",
                      resize: "none",
                    }}
                    data-cy="work-order-metadata-input"
                  />
                </LabeledField>
              </div>
            ),
          },
          {
            key: "schedule",
            label: (
              <Space size={6} data-cy="work-order-tab-schedule">
                <CalendarOutlined />
                {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k108")}
              </Space>
            ),
            children: (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobileViewport
                      ? "1fr"
                      : "repeat(2, minmax(0, 1fr))",
                    gap: 12,
                  }}
                >
                  <LabeledField label={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k109")} icon={<CalendarOutlined />}>
                    <DatePicker
                      showTime={{ format: APP_TIME_FORMAT }}
                      format={APP_DATE_TIME_FORMAT}
                      placeholder={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k110")}
                      value={toDayjsValue(draft.scheduledStartAt)}
                      onChange={(value) => updateDraft({ scheduledStartAt: toIsoDateTimeValue(value) })}
                      data-cy="work-order-scheduled-start-input"
                    />
                  </LabeledField>
                  <LabeledField label={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k111")} icon={<CalendarOutlined />}>
                    <DatePicker
                      showTime={{ format: APP_TIME_FORMAT }}
                      format={APP_DATE_TIME_FORMAT}
                      placeholder={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k112")}
                      value={toDayjsValue(draft.scheduledEndAt)}
                      onChange={(value) => updateDraft({ scheduledEndAt: toIsoDateTimeValue(value) })}
                      data-cy="work-order-scheduled-end-input"
                    />
                  </LabeledField>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobileViewport
                      ? "1fr"
                      : "repeat(2, minmax(0, 1fr))",
                    gap: 12,
                  }}
                >
                  <LabeledField label={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k113")} icon={<CalendarOutlined />}>
                    <DatePicker
                      showTime={{ format: APP_TIME_FORMAT }}
                      format={APP_DATE_TIME_FORMAT}
                      placeholder={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k114")}
                      value={toDayjsValue(draft.dueAt)}
                      onChange={(value) => updateDraft({ dueAt: toIsoDateTimeValue(value) })}
                      data-cy="work-order-due-at-input"
                    />
                  </LabeledField>
                  <LabeledField label={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k115")} icon={<ClockCircleOutlined />}>
                    <InputNumber
                      min={0}
                      placeholder={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k116")}
                      value={draft.estimatedDurationMinutes ?? undefined}
                      onChange={(value) => updateDraft({ estimatedDurationMinutes: value ?? null })}
                      style={{ width: "100%" }}
                      data-cy="work-order-estimated-duration-input"
                    />
                  </LabeledField>
                </div>

                {isEditing ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobileViewport
                        ? "1fr"
                        : "repeat(2, minmax(0, 1fr))",
                      gap: 12,
                    }}
                  >
                    <LabeledField label={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k117")} icon={<ClockCircleOutlined />}>
                      <InputNumber
                        min={0}
                        placeholder={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k118")}
                        value={draft.actualDurationMinutes ?? undefined}
                        onChange={(value) => updateDraft({ actualDurationMinutes: value ?? null })}
                        style={{ width: "100%" }}
                      />
                    </LabeledField>
                    <LabeledField label={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k119")} icon={<CalendarOutlined />}>
                      <DatePicker
                        showTime={{ format: APP_TIME_FORMAT }}
                        format={APP_DATE_TIME_FORMAT}
                        placeholder={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k120")}
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
              <Space size={6} data-cy="work-order-tab-team">
                <TeamOutlined />
                {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k121")}
              </Space>
            ),
            children: (
              <WorkOrderFormTeamTab
                isMobileViewport={isMobileViewport}
                workers={draft.workers ?? []}
                workerOptions={workerOptions}
                onAddWorker={addWorker}
                onUpdateWorker={updateWorker}
                onRemoveWorker={removeWorker}
              />
            ),
          },
          {
            key: "lines",
            label: (
              <Space size={6} data-cy="work-order-tab-lines">
                <UnorderedListOutlined />
                {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k135")}
              </Space>
            ),
            children: (
              <WorkOrderFormLinesTab
                isMobileViewport={isMobileViewport}
                lineMode={lineMode}
                onLineModeChange={setLineMode}
                serviceLines={draft.serviceLines ?? []}
                inventoryLines={draft.inventoryLines ?? []}
                services={services}
                serviceOptions={serviceOptions}
                inventoryItemOptions={inventoryItemOptions}
                inventoryById={inventoryById}
                moneyMaskCents={moneyMaskCents}
                onAddServiceLine={addServiceLine}
                onRemoveServiceLine={removeServiceLine}
                onUpdateServiceLine={updateServiceLine}
                onAddInventoryLine={addInventoryLine}
                onRemoveInventoryLine={removeInventoryLine}
                onUpdateInventoryLine={updateInventoryLine}
              />
            ),
          },
          {
            key: "activity",
            label: (
              <Space size={6} data-cy="work-order-tab-activity">
                <ScheduleOutlined />
                {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k170")}
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
          data-cy="work-order-submit-button"
        >
          {isEditing ? appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k171") : appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k172")}
        </Button>
      </div>
    </div>
  );
}

export default WorkOrderForm;
