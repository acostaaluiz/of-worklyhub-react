import { BaseHttpService } from "@core/http/base-http.service";
import type { HttpClient } from "@core/http/interfaces/http-client.interface";
import type {
  CreateWorkOrderInput,
  CreateWorkOrderStatusInput,
  ListWorkOrdersFilters,
  UpdateWorkOrderInput,
  WorkOrder,
  WorkOrderStatus,
} from "@modules/work-order/interfaces/work-order.model";

export type WorkOrderStatusListResponse = { data: WorkOrderStatus[] };
export type WorkOrderStatusResponse = { data: WorkOrderStatus };
export type WorkOrderListResponse = { data: WorkOrder[] };
export type WorkOrderResponse = { data: WorkOrder };

export class WorkOrderApi extends BaseHttpService {
  constructor(http: HttpClient) {
    super(http, { correlationNamespace: "work-order-api" });
  }

  private buildHeaders(workspaceId?: string): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (workspaceId) headers["x-workspace-id"] = workspaceId;
    return headers;
  }

  async getStatuses(workspaceId?: string): Promise<WorkOrderStatus[]> {
    const headers = this.buildHeaders(workspaceId);
    const res = await this.get<WorkOrderStatusListResponse>(
      "/work-order/statuses",
      undefined,
      headers
    );
    return res?.data ?? [];
  }

  async createStatus(
    workspaceId: string | undefined,
    payload: CreateWorkOrderStatusInput
  ): Promise<WorkOrderStatus> {
    const headers = this.buildHeaders(workspaceId);
    const res = await this.post<WorkOrderStatusResponse, CreateWorkOrderStatusInput>(
      "/work-order/statuses",
      payload,
      headers
    );
    return res?.data as WorkOrderStatus;
  }

  async createWorkOrder(
    workspaceId: string | undefined,
    payload: CreateWorkOrderInput
  ): Promise<WorkOrder> {
    const headers = this.buildHeaders(workspaceId);
    const res = await this.post<WorkOrderResponse, CreateWorkOrderInput>(
      "/work-order/work-orders",
      payload,
      headers
    );
    return res?.data as WorkOrder;
  }

  async listWorkOrders(
    workspaceId: string | undefined,
    filters: ListWorkOrdersFilters = {}
  ): Promise<WorkOrder[]> {
    const headers = this.buildHeaders(workspaceId);
    const query: ListWorkOrdersFilters = { ...filters };
    if (workspaceId && !query.workspaceId) query.workspaceId = workspaceId;
    const res = await this.get<WorkOrderListResponse>(
      "/work-order/work-orders",
      query,
      headers
    );
    return res?.data ?? [];
  }

  async getWorkOrderById(
    workspaceId: string | undefined,
    id: string
  ): Promise<WorkOrder> {
    const headers = this.buildHeaders(workspaceId);
    const res = await this.get<WorkOrderResponse>(
      `/work-order/work-orders/${id}`,
      undefined,
      headers
    );
    return res?.data as WorkOrder;
  }

  async updateWorkOrder(
    workspaceId: string | undefined,
    id: string,
    payload: UpdateWorkOrderInput
  ): Promise<WorkOrder> {
    const headers = this.buildHeaders(workspaceId);
    const res = await this.patch<WorkOrderResponse, UpdateWorkOrderInput>(
      `/work-order/work-orders/${id}`,
      payload,
      headers
    );
    return res?.data as WorkOrder;
  }

  async deleteWorkOrder(
    workspaceId: string | undefined,
    id: string
  ): Promise<void> {
    const headers = this.buildHeaders(workspaceId);
    await this.delete<void>(`/work-order/work-orders/${id}`, undefined, headers);
  }
}

export default WorkOrderApi;
