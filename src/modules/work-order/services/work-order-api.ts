import { BaseHttpService } from "@core/http/base-http.service";
import type { HttpClient } from "@core/http/interfaces/http-client.interface";
import type {
  CreateWorkOrderInput,
  CreateWorkOrderStatusInput,
  CreateWorkOrderChecklistItemInput,
  CreateWorkOrderCommentInput,
  CreateWorkOrderAttachmentInput,
  GetWorkOrderOverviewOptions,
  ListWorkOrdersFilters,
  RequestWorkOrderAttachmentUploadSignatureInput,
  WorkOrderListPage,
  WorkOrderListPagination,
  UpdateWorkOrderInput,
  UpdateWorkOrderChecklistItemInput,
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

export type WorkOrderStatusListResponse = { data: WorkOrderStatus[] };
export type WorkOrderStatusResponse = { data: WorkOrderStatus };
type WorkOrderListMetaLike = Partial<{
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
  nextOffset: number | null;
}>;
type WorkOrderListPayload =
  | WorkOrder[]
  | {
      data?: WorkOrder[];
      meta?: WorkOrderListMetaLike;
      pagination?: WorkOrderListMetaLike;
      pageInfo?: WorkOrderListMetaLike;
    };
export type WorkOrderResponse = { data: WorkOrder };
export type WorkOrderHistoryResponse = { data: WorkOrderStatusHistoryEntry[] };
export type WorkOrderCommentsResponse = { data: WorkOrderComment[] };
export type WorkOrderCommentResponse = { data: WorkOrderComment };
export type WorkOrderChecklistResponse = { data: WorkOrderChecklistItem[] };
export type WorkOrderChecklistItemResponse = { data: WorkOrderChecklistItem };
export type WorkOrderAttachmentsResponse = { data: WorkOrderAttachment[] };
export type WorkOrderAttachmentResponse = { data: WorkOrderAttachment };
export type WorkOrderAttachmentUploadSignatureResponse = WorkOrderAttachmentUploadSignature;
export type WorkOrderOverviewResponse = { data: WorkOrderOverview };
export type WorkOrderSettingsResponse = { data: WorkOrderWorkspaceSettingsBundle };
export type UpsertWorkOrderSettingsRequest = {
  workspaceId?: string;
  settings: Partial<WorkOrderWorkspaceSettings>;
  updatedBy?: string | null;
};

export class WorkOrderApi extends BaseHttpService {
  constructor(http: HttpClient) {
    super(http, { correlationNamespace: "work-order-api" });
  }

  private toPositiveInt(value: DataValue, fallback: number): number {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric < 0) return fallback;
    return Math.floor(numeric);
  }

  private normalizePagination(
    items: WorkOrder[],
    requested: ListWorkOrdersFilters,
    meta?: WorkOrderListMetaLike
  ): WorkOrderListPagination {
    const requestedLimit = this.toPositiveInt(requested.limit, 25);
    const requestedOffset = this.toPositiveInt(requested.offset, 0);
    const limit = this.toPositiveInt(meta?.limit, requestedLimit);
    const offset = this.toPositiveInt(meta?.offset, requestedOffset);
    const explicitHasMore = typeof meta?.hasMore === "boolean" ? meta.hasMore : undefined;
    const derivedHasMore =
      explicitHasMore ??
      (typeof meta?.nextOffset === "number" ? meta.nextOffset > offset : items.length >= limit);
    const hasMore = Boolean(derivedHasMore) && items.length > 0;
    const nextOffset =
      typeof meta?.nextOffset === "number"
        ? this.toPositiveInt(meta.nextOffset, offset + items.length)
        : hasMore
          ? offset + items.length
          : null;
    const explicitTotal = this.toPositiveInt(meta?.total, Number.NaN);
    const total = Number.isFinite(explicitTotal)
      ? explicitTotal
      : hasMore
        ? offset + items.length + 1
        : offset + items.length;

    return {
      limit,
      offset,
      total,
      hasMore,
      nextOffset,
    };
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

  async getSettings(workspaceId?: string): Promise<WorkOrderWorkspaceSettingsBundle> {
    const headers = this.buildHeaders(workspaceId);
    const res = await this.get<WorkOrderSettingsResponse>(
      "/work-order/settings",
      workspaceId ? { workspaceId } : undefined,
      headers
    );
    return res?.data as WorkOrderWorkspaceSettingsBundle;
  }

  async upsertSettings(
    workspaceId: string | undefined,
    payload: UpsertWorkOrderSettingsRequest
  ): Promise<WorkOrderWorkspaceSettingsBundle> {
    const headers = this.buildHeaders(workspaceId);
    const res = await this.put<WorkOrderSettingsResponse, UpsertWorkOrderSettingsRequest>(
      "/work-order/settings",
      payload,
      headers
    );
    return res?.data as WorkOrderWorkspaceSettingsBundle;
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
  ): Promise<WorkOrderListPage> {
    const headers = this.buildHeaders(workspaceId);
    const query: ListWorkOrdersFilters = { ...filters };
    if (workspaceId && !query.workspaceId) query.workspaceId = workspaceId;
    const res = await this.get<WorkOrderListPayload>(
      "/work-order/work-orders",
      query,
      headers
    );

    if (Array.isArray(res)) {
      return {
        data: res,
        pagination: this.normalizePagination(res, query),
      };
    }

    const data = Array.isArray(res?.data) ? res.data : [];
    const meta = res?.pagination ?? res?.meta ?? res?.pageInfo;
    return {
      data,
      pagination: this.normalizePagination(data, query, meta),
    };
  }

  async getOverview(
    workspaceId: string | undefined,
    options: GetWorkOrderOverviewOptions = {}
  ): Promise<WorkOrderOverview> {
    const headers = this.buildHeaders(workspaceId);
    const query: GetWorkOrderOverviewOptions = { ...options };
    const res = await this.get<WorkOrderOverviewResponse>(
      "/work-order/work-orders/overview",
      query,
      headers
    );
    return res?.data as WorkOrderOverview;
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

  async getHistory(
    workspaceId: string | undefined,
    id: string
  ): Promise<WorkOrderStatusHistoryEntry[]> {
    const headers = this.buildHeaders(workspaceId);
    const res = await this.get<WorkOrderHistoryResponse>(
      `/work-order/work-orders/${id}/history`,
      undefined,
      headers
    );
    return res?.data ?? [];
  }

  async getComments(
    workspaceId: string | undefined,
    id: string
  ): Promise<WorkOrderComment[]> {
    const headers = this.buildHeaders(workspaceId);
    const res = await this.get<WorkOrderCommentsResponse>(
      `/work-order/work-orders/${id}/comments`,
      undefined,
      headers
    );
    return res?.data ?? [];
  }

  async createComment(
    workspaceId: string | undefined,
    id: string,
    payload: CreateWorkOrderCommentInput
  ): Promise<WorkOrderComment> {
    const headers = this.buildHeaders(workspaceId);
    const res = await this.post<WorkOrderCommentResponse, CreateWorkOrderCommentInput>(
      `/work-order/work-orders/${id}/comments`,
      payload,
      headers
    );
    return res?.data as WorkOrderComment;
  }

  async getChecklist(
    workspaceId: string | undefined,
    id: string
  ): Promise<WorkOrderChecklistItem[]> {
    const headers = this.buildHeaders(workspaceId);
    const res = await this.get<WorkOrderChecklistResponse>(
      `/work-order/work-orders/${id}/checklist`,
      undefined,
      headers
    );
    return res?.data ?? [];
  }

  async createChecklistItem(
    workspaceId: string | undefined,
    id: string,
    payload: CreateWorkOrderChecklistItemInput
  ): Promise<WorkOrderChecklistItem> {
    const headers = this.buildHeaders(workspaceId);
    const res = await this.post<
      WorkOrderChecklistItemResponse,
      CreateWorkOrderChecklistItemInput
    >(`/work-order/work-orders/${id}/checklist`, payload, headers);
    return res?.data as WorkOrderChecklistItem;
  }

  async updateChecklistItem(
    workspaceId: string | undefined,
    id: string,
    itemId: string,
    payload: UpdateWorkOrderChecklistItemInput
  ): Promise<WorkOrderChecklistItem> {
    const headers = this.buildHeaders(workspaceId);
    const res = await this.patch<
      WorkOrderChecklistItemResponse,
      UpdateWorkOrderChecklistItemInput
    >(`/work-order/work-orders/${id}/checklist/${itemId}`, payload, headers);
    return res?.data as WorkOrderChecklistItem;
  }

  async deleteChecklistItem(
    workspaceId: string | undefined,
    id: string,
    itemId: string
  ): Promise<void> {
    const headers = this.buildHeaders(workspaceId);
    await this.delete<void>(
      `/work-order/work-orders/${id}/checklist/${itemId}`,
      undefined,
      headers
    );
  }

  async getAttachments(
    workspaceId: string | undefined,
    id: string
  ): Promise<WorkOrderAttachment[]> {
    const headers = this.buildHeaders(workspaceId);
    const res = await this.get<WorkOrderAttachmentsResponse>(
      `/work-order/work-orders/${id}/attachments`,
      undefined,
      headers
    );
    return res?.data ?? [];
  }

  async requestAttachmentUploadSignature(
    workspaceId: string | undefined,
    id: string,
    payload: RequestWorkOrderAttachmentUploadSignatureInput
  ): Promise<WorkOrderAttachmentUploadSignature> {
    const headers = this.buildHeaders(workspaceId);
    const res = await this.post<
      WorkOrderAttachmentUploadSignatureResponse,
      RequestWorkOrderAttachmentUploadSignatureInput
    >(`/work-order/work-orders/${id}/attachments/signature`, payload, headers);
    return res as WorkOrderAttachmentUploadSignature;
  }

  async createAttachment(
    workspaceId: string | undefined,
    id: string,
    payload: CreateWorkOrderAttachmentInput
  ): Promise<WorkOrderAttachment> {
    const headers = this.buildHeaders(workspaceId);
    const res = await this.post<WorkOrderAttachmentResponse, CreateWorkOrderAttachmentInput>(
      `/work-order/work-orders/${id}/attachments`,
      payload,
      headers
    );
    return res?.data as WorkOrderAttachment;
  }

  async deleteAttachment(
    workspaceId: string | undefined,
    id: string,
    attachmentId: string
  ): Promise<void> {
    const headers = this.buildHeaders(workspaceId);
    await this.delete<void>(
      `/work-order/work-orders/${id}/attachments/${attachmentId}`,
      undefined,
      headers
    );
  }
}

export default WorkOrderApi;
