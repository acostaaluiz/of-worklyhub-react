import { formatAppDateTime } from "@core/utils/date-time";
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
import type { CompanyServiceModel } from "@modules/company/interfaces/service.model";
import type { InventoryItem } from "@modules/inventory/services/inventory-api";

export const priorityValues: WorkOrderPriority[] = ["low", "medium", "high", "urgent"];

export const attachmentAccept =
  "image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.ppt,.pptx,.zip,.rar";

export const maxAttachmentSizeMb = 25;

export type WorkOrderDraft = {
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

export type WorkOrderFormProps = {
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

export type WorkOrderAutomationView = {
  automationTag: {
    color: "success" | "warning" | "processing";
    label: string;
  };
  automationSummary: string;
  automationNfeNote: string;
};

export function buildWorkOrderAutomationView(input: {
  hasFinanceEntry: boolean;
  expectedAutomation: boolean;
  isDevEnvironment: boolean;
  t: (key: string) => string;
}): WorkOrderAutomationView {
  const automationTag = input.hasFinanceEntry
    ? {
        color: "success" as const,
        label: input.t(
          "legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k001"
        ),
      }
    : input.expectedAutomation
      ? {
          color: "warning" as const,
          label: input.t(
            "legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k002"
          ),
        }
      : {
          color: "processing" as const,
          label: input.t(
            "legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k003"
          ),
        };

  const automationSummary = input.hasFinanceEntry
    ? input.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k004")
    : input.expectedAutomation
      ? input.t(
          "legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k005"
        )
      : input.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k006");

  const automationNfeNote = input.isDevEnvironment
    ? input.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k007")
    : input.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k008");

  return {
    automationTag,
    automationSummary,
    automationNfeNote,
  };
}

export function formatDateTime(value?: string | null): string {
  return formatAppDateTime(value, "--");
}

export function formatAttachmentSize(sizeBytes?: number | null): string {
  if (typeof sizeBytes !== "number" || !Number.isFinite(sizeBytes) || sizeBytes < 0) {
    return "";
  }
  return `${(sizeBytes / 1024 / 1024).toFixed(2)} MB`;
}

export function buildEmptyDraft(workspaceId?: string, uid?: string | null): WorkOrderDraft {
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

export function mapFromInitial(initial: WorkOrder): WorkOrderDraft {
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
