export type WorkOrderPriority = "low" | "medium" | "high" | "urgent";
export type WorkOrderRiskLevel =
  | "overdue"
  | "due_soon"
  | "unscheduled"
  | "checklist_at_risk"
  | "high_priority";

export type WorkOrderStatus = {
  id: string;
  code: string;
  label: string;
  isTerminal: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type WorkOrderStatusHistoryEntry = {
  id: string;
  workOrderId: string;
  previousStatus?: WorkOrderStatus | null;
  newStatus: WorkOrderStatus;
  changedBy?: string | null;
  notes?: string | null;
  changedAt: string;
};

export type WorkOrderComment = {
  id: string;
  workOrderId: string;
  workspaceId: string;
  authorUid?: string | null;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type WorkOrderChecklistItem = {
  id: string;
  workOrderId: string;
  workspaceId: string;
  title: string;
  sortOrder: number;
  isDone: boolean;
  createdBy?: string | null;
  completedBy?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type WorkOrderOverviewInsightSeverity = "high" | "medium" | "low";

export type WorkOrderOverview = {
  generatedAt: string;
  totals: {
    total: number;
    active: number;
    terminal: number;
    overdue: number;
    dueSoon: number;
    highPriorityOpen: number;
    unscheduled: number;
    checklistAtRisk: number;
  };
  performance: {
    completionRate: number;
    avgResolutionHours: number;
  };
  buckets: {
    byStatus: Array<{
      statusId: string;
      code: string;
      label: string;
      count: number;
    }>;
    byPriority: Array<{
      priority: WorkOrderPriority;
      count: number;
    }>;
  };
  insights: Array<{
    code: string;
    severity: WorkOrderOverviewInsightSeverity;
    title: string;
    description: string;
    suggestedAction: string;
  }>;
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

export type CreateWorkOrderCommentInput = {
  body: string;
  authorUid?: string | null;
};

export type CreateWorkOrderChecklistItemInput = {
  title: string;
  sortOrder: number;
  createdBy?: string | null;
};

export type UpdateWorkOrderChecklistItemInput = {
  title?: string;
  sortOrder?: number;
  isDone?: boolean;
  completedBy?: string | null;
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
  metadata?: DataMap;
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
  metadata: DataMap;
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
  riskLevel?: WorkOrderRiskLevel;
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

export type WorkOrderListPagination = {
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
  nextOffset: number | null;
};

export type WorkOrderListPage = {
  data: WorkOrder[];
  pagination: WorkOrderListPagination;
};

export type GetWorkOrderOverviewOptions = {
  dueSoonHours?: number;
  windowDays?: number;
};
