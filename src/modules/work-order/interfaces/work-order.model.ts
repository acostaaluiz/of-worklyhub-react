export type WorkOrderPriority = "low" | "medium" | "high" | "urgent";

export type WorkOrderStatus = {
  id: string;
  code: string;
  label: string;
  isTerminal: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type WorkOrderServiceLineInput = {
  serviceId: string;
  quantity?: number;
  unitPriceCents?: number;
  notes?: string | null;
};

export type WorkOrderWorkerInput = {
  workspaceId: string;
  userUid: string;
  assignmentRole?: "executor" | "assistant" | "reviewer";
  allocatedMinutes?: number;
};

export type WorkOrderInventoryLineInput = {
  inventoryItemId: string;
  direction?: "input" | "output";
  plannedQuantity?: number;
  consumedQuantity?: number;
  unitCostCents?: number;
};

export type CreateWorkOrderStatusInput = {
  code: string;
  label: string;
  isTerminal?: boolean;
  sortOrder?: number;
};

export type CreateWorkOrderInput = {
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
  metadata?: Record<string, unknown>;
  serviceLines?: WorkOrderServiceLineInput[];
  workers?: WorkOrderWorkerInput[];
  inventoryLines?: WorkOrderInventoryLineInput[];
};

export type UpdateWorkOrderInput = Partial<CreateWorkOrderInput> & {
  workspaceId: string;
  updatedBy?: string | null;
  actualDurationMinutes?: number | null;
  completedAt?: string | null;
};

export type WorkOrder = {
  id: string;
  workspaceId: string;
  status: WorkOrderStatus;
  title: string;
  description?: string | null;
  priority: WorkOrderPriority;
  requesterUserUid?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  scheduledStartAt?: string | null;
  scheduledEndAt?: string | null;
  scheduledEventId?: string | null;
  financeEntryId?: string | null;
  estimatedDurationMinutes?: number | null;
  actualDurationMinutes?: number | null;
  serviceTotalCents: number;
  inventoryTotalCents: number;
  totalEstimatedCents: number;
  executionStartedAt?: string | null;
  completedAt?: string | null;
  dueAt?: string | null;
  metadata: Record<string, unknown>;
  serviceLines: Array<{
    id: string;
    serviceId: string;
    quantity: number;
    unitPriceCents: number;
    totalPriceCents: number;
    notes?: string | null;
  }>;
  workers: Array<{
    workspaceId: string;
    userUid: string;
    assignmentRole: "executor" | "assistant" | "reviewer";
    allocatedMinutes: number;
  }>;
  inventoryLines: Array<{
    id: string;
    inventoryItemId: string;
    direction: "input" | "output";
    plannedQuantity: number;
    consumedQuantity: number;
    unitCostCents: number;
    totalCostCents: number;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type ListWorkOrdersFilters = {
  workspaceId?: string;
  statusId?: string;
  statusCode?: string;
  priority?: WorkOrderPriority;
  requesterUserUid?: string;
  assignedUserUid?: string;
  scheduledFrom?: string;
  scheduledTo?: string;
  dueFrom?: string;
  dueTo?: string;
  search?: string;
  limit?: number;
  offset?: number;
};
