import { httpClient } from "@core/http/client.instance";
import { toAppError } from "@core/errors/to-app-error";
import WorkOrderApi from "@modules/work-order/services/work-order-api";
import type {
  CreateWorkOrderInput,
  CreateWorkOrderStatusInput,
  ListWorkOrdersFilters,
  UpdateWorkOrderInput,
  WorkOrder,
  WorkOrderStatus,
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

  async listWorkOrders(
    workspaceId: string | undefined,
    filters: ListWorkOrdersFilters = {}
  ): Promise<WorkOrder[]> {
    try {
      return await this.api.listWorkOrders(workspaceId, filters);
    } catch (err) {
      throw toAppError(err);
    }
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

export async function listWorkOrders(
  workspaceId: string | undefined,
  filters: ListWorkOrdersFilters = {}
): Promise<WorkOrder[]> {
  return workOrderHttpService.listWorkOrders(workspaceId, filters);
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

export default workOrderHttpService;
