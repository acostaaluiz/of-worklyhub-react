import { httpClient } from "@core/http/client.instance";
import { toAppError } from "@core/errors/to-app-error";
import WorkOrderApi from "@modules/work-order/services/work-order-api";
import type {
  CreateWorkOrderInput,
  CreateWorkOrderStatusInput,
  CreateWorkOrderChecklistItemInput,
  CreateWorkOrderCommentInput,
  CreateWorkOrderAttachmentInput,
  GetWorkOrderOverviewOptions,
  ListWorkOrdersFilters,
  RequestWorkOrderAttachmentUploadSignatureInput,
  UpdateWorkOrderInput,
  UpdateWorkOrderChecklistItemInput,
  WorkOrderListPage,
  WorkOrder,
  WorkOrderAttachment,
  WorkOrderAttachmentUploadSignature,
  WorkOrderChecklistItem,
  WorkOrderComment,
  WorkOrderOverview,
  WorkOrderStatusHistoryEntry,
  WorkOrderStatus,
  WorkOrderWorkspaceSettings,
  WorkOrderWorkspaceSettingsBundle,
} from "@modules/work-order/interfaces/work-order.model";

export class WorkOrderHttpService {
  private api = new WorkOrderApi(httpClient);

  async listStatuses(workspaceId?: string): Promise<WorkOrderStatus[]> {
    try {
      return await this.api.getStatuses(workspaceId);
    } catch (err) {
      throw toAppError(err);
    }
  }

  async createStatus(
    workspaceId: string | undefined,
    payload: CreateWorkOrderStatusInput
  ): Promise<WorkOrderStatus> {
    try {
      return await this.api.createStatus(workspaceId, payload);
    } catch (err) {
      throw toAppError(err);
    }
  }

  async listWorkOrdersPage(
    workspaceId: string | undefined,
    filters: ListWorkOrdersFilters = {}
  ): Promise<WorkOrderListPage> {
    try {
      return await this.api.listWorkOrders(workspaceId, filters);
    } catch (err) {
      throw toAppError(err);
    }
  }

  async listWorkOrders(
    workspaceId: string | undefined,
    filters: ListWorkOrdersFilters = {}
  ): Promise<WorkOrder[]> {
    const page = await this.listWorkOrdersPage(workspaceId, filters);
    return page.data;
  }

  async getWorkOrderById(
    workspaceId: string | undefined,
    id: string
  ): Promise<WorkOrder> {
    try {
      return await this.api.getWorkOrderById(workspaceId, id);
    } catch (err) {
      throw toAppError(err);
    }
  }

  async createWorkOrder(
    workspaceId: string | undefined,
    payload: CreateWorkOrderInput
  ): Promise<WorkOrder> {
    try {
      const resolvedWorkspaceId = payload.workspaceId || workspaceId;
      if (!resolvedWorkspaceId) throw new Error("workspaceId is required");
      const body = { ...payload, workspaceId: resolvedWorkspaceId };
      return await this.api.createWorkOrder(workspaceId, body);
    } catch (err) {
      throw toAppError(err);
    }
  }

  async updateWorkOrder(
    workspaceId: string | undefined,
    id: string,
    payload: UpdateWorkOrderInput
  ): Promise<WorkOrder> {
    try {
      const resolvedWorkspaceId = payload.workspaceId || workspaceId;
      if (!resolvedWorkspaceId) throw new Error("workspaceId is required");
      const body = { ...payload, workspaceId: resolvedWorkspaceId };
      return await this.api.updateWorkOrder(workspaceId, id, body);
    } catch (err) {
      throw toAppError(err);
    }
  }

  async deleteWorkOrder(
    workspaceId: string | undefined,
    id: string
  ): Promise<void> {
    try {
      await this.api.deleteWorkOrder(workspaceId, id);
    } catch (err) {
      throw toAppError(err);
    }
  }

  async getOverview(
    workspaceId: string | undefined,
    options: GetWorkOrderOverviewOptions = {}
  ): Promise<WorkOrderOverview> {
    try {
      if (!workspaceId) throw new Error("workspaceId is required");
      return await this.api.getOverview(workspaceId, options);
    } catch (err) {
      throw toAppError(err);
    }
  }

  async listHistory(
    workspaceId: string | undefined,
    workOrderId: string
  ): Promise<WorkOrderStatusHistoryEntry[]> {
    try {
      if (!workspaceId) throw new Error("workspaceId is required");
      return await this.api.getHistory(workspaceId, workOrderId);
    } catch (err) {
      throw toAppError(err);
    }
  }

  async listComments(
    workspaceId: string | undefined,
    workOrderId: string
  ): Promise<WorkOrderComment[]> {
    try {
      if (!workspaceId) throw new Error("workspaceId is required");
      return await this.api.getComments(workspaceId, workOrderId);
    } catch (err) {
      throw toAppError(err);
    }
  }

  async createComment(
    workspaceId: string | undefined,
    workOrderId: string,
    payload: CreateWorkOrderCommentInput
  ): Promise<WorkOrderComment> {
    try {
      if (!workspaceId) throw new Error("workspaceId is required");
      return await this.api.createComment(workspaceId, workOrderId, payload);
    } catch (err) {
      throw toAppError(err);
    }
  }

  async listChecklist(
    workspaceId: string | undefined,
    workOrderId: string
  ): Promise<WorkOrderChecklistItem[]> {
    try {
      if (!workspaceId) throw new Error("workspaceId is required");
      return await this.api.getChecklist(workspaceId, workOrderId);
    } catch (err) {
      throw toAppError(err);
    }
  }

  async createChecklistItem(
    workspaceId: string | undefined,
    workOrderId: string,
    payload: CreateWorkOrderChecklistItemInput
  ): Promise<WorkOrderChecklistItem> {
    try {
      if (!workspaceId) throw new Error("workspaceId is required");
      return await this.api.createChecklistItem(workspaceId, workOrderId, payload);
    } catch (err) {
      throw toAppError(err);
    }
  }

  async updateChecklistItem(
    workspaceId: string | undefined,
    workOrderId: string,
    itemId: string,
    payload: UpdateWorkOrderChecklistItemInput
  ): Promise<WorkOrderChecklistItem> {
    try {
      if (!workspaceId) throw new Error("workspaceId is required");
      return await this.api.updateChecklistItem(workspaceId, workOrderId, itemId, payload);
    } catch (err) {
      throw toAppError(err);
    }
  }

  async deleteChecklistItem(
    workspaceId: string | undefined,
    workOrderId: string,
    itemId: string
  ): Promise<void> {
    try {
      if (!workspaceId) throw new Error("workspaceId is required");
      await this.api.deleteChecklistItem(workspaceId, workOrderId, itemId);
    } catch (err) {
      throw toAppError(err);
    }
  }

  async getSettings(workspaceId: string | undefined): Promise<WorkOrderWorkspaceSettingsBundle> {
    try {
      if (!workspaceId) throw new Error("workspaceId is required");
      return await this.api.getSettings(workspaceId);
    } catch (err) {
      throw toAppError(err);
    }
  }

  async upsertSettings(
    workspaceId: string | undefined,
    settings: Partial<WorkOrderWorkspaceSettings>,
    updatedBy?: string | null
  ): Promise<WorkOrderWorkspaceSettingsBundle> {
    try {
      if (!workspaceId) throw new Error("workspaceId is required");
      return await this.api.upsertSettings(workspaceId, {
        workspaceId,
        settings,
        updatedBy,
      });
    } catch (err) {
      throw toAppError(err);
    }
  }

  async listAttachments(
    workspaceId: string | undefined,
    workOrderId: string
  ): Promise<WorkOrderAttachment[]> {
    try {
      if (!workspaceId) throw new Error("workspaceId is required");
      return await this.api.getAttachments(workspaceId, workOrderId);
    } catch (err) {
      throw toAppError(err);
    }
  }

  async requestAttachmentUploadSignature(
    workspaceId: string | undefined,
    workOrderId: string,
    payload: RequestWorkOrderAttachmentUploadSignatureInput
  ): Promise<WorkOrderAttachmentUploadSignature> {
    try {
      if (!workspaceId) throw new Error("workspaceId is required");
      return await this.api.requestAttachmentUploadSignature(workspaceId, workOrderId, payload);
    } catch (err) {
      throw toAppError(err);
    }
  }

  async createAttachment(
    workspaceId: string | undefined,
    workOrderId: string,
    payload: CreateWorkOrderAttachmentInput
  ): Promise<WorkOrderAttachment> {
    try {
      if (!workspaceId) throw new Error("workspaceId is required");
      return await this.api.createAttachment(workspaceId, workOrderId, payload);
    } catch (err) {
      throw toAppError(err);
    }
  }

  async deleteAttachment(
    workspaceId: string | undefined,
    workOrderId: string,
    attachmentId: string
  ): Promise<void> {
    try {
      if (!workspaceId) throw new Error("workspaceId is required");
      await this.api.deleteAttachment(workspaceId, workOrderId, attachmentId);
    } catch (err) {
      throw toAppError(err);
    }
  }
}

export const workOrderHttpService = new WorkOrderHttpService();

export async function listWorkOrderStatuses(workspaceId?: string): Promise<WorkOrderStatus[]> {
  return workOrderHttpService.listStatuses(workspaceId);
}

export async function createWorkOrderStatus(
  workspaceId: string | undefined,
  payload: CreateWorkOrderStatusInput
): Promise<WorkOrderStatus> {
  return workOrderHttpService.createStatus(workspaceId, payload);
}

export async function getWorkOrderSettings(
  workspaceId: string | undefined
): Promise<WorkOrderWorkspaceSettingsBundle> {
  return workOrderHttpService.getSettings(workspaceId);
}

export async function upsertWorkOrderSettings(
  workspaceId: string | undefined,
  settings: Partial<WorkOrderWorkspaceSettings>,
  updatedBy?: string | null
): Promise<WorkOrderWorkspaceSettingsBundle> {
  return workOrderHttpService.upsertSettings(workspaceId, settings, updatedBy);
}

export async function listWorkOrders(
  workspaceId: string | undefined,
  filters: ListWorkOrdersFilters = {}
): Promise<WorkOrder[]> {
  return workOrderHttpService.listWorkOrders(workspaceId, filters);
}

export async function listWorkOrdersPage(
  workspaceId: string | undefined,
  filters: ListWorkOrdersFilters = {}
): Promise<WorkOrderListPage> {
  return workOrderHttpService.listWorkOrdersPage(workspaceId, filters);
}

export async function getWorkOrderById(
  workspaceId: string | undefined,
  id: string
): Promise<WorkOrder> {
  return workOrderHttpService.getWorkOrderById(workspaceId, id);
}

export async function createWorkOrder(
  workspaceId: string | undefined,
  payload: CreateWorkOrderInput
): Promise<WorkOrder> {
  return workOrderHttpService.createWorkOrder(workspaceId, payload);
}

export async function updateWorkOrder(
  workspaceId: string | undefined,
  id: string,
  payload: UpdateWorkOrderInput
): Promise<WorkOrder> {
  return workOrderHttpService.updateWorkOrder(workspaceId, id, payload);
}

export async function deleteWorkOrder(
  workspaceId: string | undefined,
  id: string
): Promise<void> {
  return workOrderHttpService.deleteWorkOrder(workspaceId, id);
}

export async function listWorkOrderOverview(
  workspaceId: string | undefined,
  options: GetWorkOrderOverviewOptions = {}
): Promise<WorkOrderOverview> {
  return workOrderHttpService.getOverview(workspaceId, options);
}

export async function listWorkOrderHistory(
  workspaceId: string | undefined,
  workOrderId: string
): Promise<WorkOrderStatusHistoryEntry[]> {
  return workOrderHttpService.listHistory(workspaceId, workOrderId);
}

export async function listWorkOrderComments(
  workspaceId: string | undefined,
  workOrderId: string
): Promise<WorkOrderComment[]> {
  return workOrderHttpService.listComments(workspaceId, workOrderId);
}

export async function createWorkOrderComment(
  workspaceId: string | undefined,
  workOrderId: string,
  payload: CreateWorkOrderCommentInput
): Promise<WorkOrderComment> {
  return workOrderHttpService.createComment(workspaceId, workOrderId, payload);
}

export async function listWorkOrderChecklist(
  workspaceId: string | undefined,
  workOrderId: string
): Promise<WorkOrderChecklistItem[]> {
  return workOrderHttpService.listChecklist(workspaceId, workOrderId);
}

export async function createWorkOrderChecklistItem(
  workspaceId: string | undefined,
  workOrderId: string,
  payload: CreateWorkOrderChecklistItemInput
): Promise<WorkOrderChecklistItem> {
  return workOrderHttpService.createChecklistItem(workspaceId, workOrderId, payload);
}

export async function updateWorkOrderChecklistItem(
  workspaceId: string | undefined,
  workOrderId: string,
  itemId: string,
  payload: UpdateWorkOrderChecklistItemInput
): Promise<WorkOrderChecklistItem> {
  return workOrderHttpService.updateChecklistItem(workspaceId, workOrderId, itemId, payload);
}

export async function deleteWorkOrderChecklistItem(
  workspaceId: string | undefined,
  workOrderId: string,
  itemId: string
): Promise<void> {
  return workOrderHttpService.deleteChecklistItem(workspaceId, workOrderId, itemId);
}

export async function listWorkOrderAttachments(
  workspaceId: string | undefined,
  workOrderId: string
): Promise<WorkOrderAttachment[]> {
  return workOrderHttpService.listAttachments(workspaceId, workOrderId);
}

export async function requestWorkOrderAttachmentUploadSignature(
  workspaceId: string | undefined,
  workOrderId: string,
  payload: RequestWorkOrderAttachmentUploadSignatureInput
): Promise<WorkOrderAttachmentUploadSignature> {
  return workOrderHttpService.requestAttachmentUploadSignature(workspaceId, workOrderId, payload);
}

export async function createWorkOrderAttachment(
  workspaceId: string | undefined,
  workOrderId: string,
  payload: CreateWorkOrderAttachmentInput
): Promise<WorkOrderAttachment> {
  return workOrderHttpService.createAttachment(workspaceId, workOrderId, payload);
}

export async function deleteWorkOrderAttachment(
  workspaceId: string | undefined,
  workOrderId: string,
  attachmentId: string
): Promise<void> {
  return workOrderHttpService.deleteAttachment(workspaceId, workOrderId, attachmentId);
}

export default workOrderHttpService;
