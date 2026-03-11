import { BaseHttpService } from "@core/http/base-http.service";
import type { HttpClient, HttpQuery } from "@core/http/interfaces/http-client.interface";

export type CreateInventoryItemPayload = {
  workspaceId: string;
  name: string;
  sku?: string | null;
  category?: string | null;
  quantity?: number;
  minQuantity?: number;
  location?: string | null;
  priceCents?: number;
  isActive?: boolean;
};

export type InventoryItem = {
  id: string;
  workspaceId: string;
  name: string;
  sku?: string | null;
  category?: string | null;
  quantity: number;
  minQuantity: number;
  location?: string | null;
  priceCents: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type InventoryMovementDirection = "in" | "out";

export type InventoryMovementSource =
  | "manual"
  | "work-order"
  | "schedule"
  | "adjustment"
  | "system";

export type InventoryMovement = {
  id: string;
  workspaceId: string;
  inventoryItemId: string;
  itemName: string;
  itemSku?: string | null;
  direction: InventoryMovementDirection;
  quantity: number;
  previousQuantity: number;
  nextQuantity: number;
  reason?: string | null;
  source: InventoryMovementSource;
  referenceType?: string | null;
  referenceId?: string | null;
  unitCostCents?: number | null;
  occurredAt: string;
  createdBy?: string | null;
  metadata?: DataMap | null;
  createdAt: string;
};

export type CreateInventoryMovementPayload = {
  workspaceId: string;
  inventoryItemId: string;
  direction: InventoryMovementDirection;
  quantity: number;
  reason?: string | null;
  source?: InventoryMovementSource;
  referenceType?: string | null;
  referenceId?: string | null;
  unitCostCents?: number | null;
  occurredAt?: string;
  createdBy?: string | null;
  metadata?: DataMap | null;
};

export type ListInventoryMovementsQuery = {
  inventoryItemId?: string;
  direction?: InventoryMovementDirection;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
};

export type InventoryAlertSeverity = "high" | "medium" | "low";

export type InventoryAlert = {
  itemId: string;
  itemName: string;
  itemSku?: string | null;
  quantity: number;
  minQuantity: number;
  shortageQuantity: number;
  recentOutput30d: number;
  severity: InventoryAlertSeverity;
  coverageDays: number | null;
};

export type InventoryPurchaseSuggestion = {
  itemId: string;
  itemName: string;
  itemSku?: string | null;
  suggestedQuantity: number;
  reason: string;
};

export type InventoryAlertsResponse = {
  generatedAt: string;
  summary: {
    total: number;
    high: number;
    medium: number;
    low: number;
  };
  alerts: InventoryAlert[];
  suggestions: InventoryPurchaseSuggestion[];
};

export type InventoryWorkspaceSettings = {
  defaultMinQuantity: number;
  defaultLocation?: string | null;
  defaultIsActive: boolean;
  requireSku: boolean;
  requireCategory: boolean;
  requireLocation: boolean;
  requireReasonOnManualMovement: boolean;
  suggestionCoverageDays: number;
  highSeverityThresholdPercent: number;
};

export type InventoryWorkspaceSettingsBundle = {
  workspaceId: string;
  settings: InventoryWorkspaceSettings;
  source: "database" | "defaults";
  updatedAt?: string;
};

type InventoryListResponse = { data: InventoryItem[] };
type InventoryItemResponse = { data: InventoryItem };
type InventoryMovementListResponse = { data: InventoryMovement[] };
type InventoryMovementResponse = { data: InventoryMovement };
type InventorySettingsResponse = { data: InventoryWorkspaceSettingsBundle };
type UpsertInventorySettingsRequest = {
  workspaceId: string;
  settings?: Partial<InventoryWorkspaceSettings>;
  updatedBy?: string | null;
};

export class InventoryApi extends BaseHttpService {
  constructor(http: HttpClient) {
    super(http, { correlationNamespace: "inventory-api" });
  }

  private buildHeaders(workspaceId?: string): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (workspaceId) headers["x-workspace-id"] = workspaceId;
    return headers;
  }

  async createItem(body: CreateInventoryItemPayload): Promise<InventoryItem> {
    const headers = this.buildHeaders(body.workspaceId);
    const res = await this.post<InventoryItemResponse, CreateInventoryItemPayload>(
      "/inventory/internal/items",
      body,
      headers
    );
    return res?.data as InventoryItem;
  }

  async listItems(workspaceId: string): Promise<InventoryItem[]> {
    const query: HttpQuery = { workspaceId };
    const headers = this.buildHeaders(workspaceId);
    const res = await this.get<InventoryListResponse>(
      "/inventory/internal/items",
      query,
      headers
    );
    return res?.data ?? [];
  }

  async getItem(id: string, workspaceId?: string): Promise<InventoryItem | null> {
    const query: HttpQuery = {};
    if (workspaceId) query.workspaceId = workspaceId;
    const headers = this.buildHeaders(workspaceId);
    const res = await this.get<InventoryItemResponse>(
      `/inventory/internal/items/${id}`,
      query,
      headers
    );
    return res?.data ?? null;
  }

  async updateItem(
    id: string,
    body: Partial<CreateInventoryItemPayload> & { workspaceId?: string }
  ): Promise<InventoryItem> {
    const headers = this.buildHeaders(body.workspaceId);
    const res = await this.patch<
      InventoryItemResponse,
      Partial<CreateInventoryItemPayload> & { workspaceId?: string }
    >(`/inventory/internal/items/${id}`, body, headers);
    return res?.data as InventoryItem;
  }

  async deleteItem(id: string, workspaceId?: string): Promise<void> {
    const query: HttpQuery = {};
    if (workspaceId) query.workspaceId = workspaceId;
    const headers = this.buildHeaders(workspaceId);
    await this.delete<void>(`/inventory/internal/items/${id}`, query, headers);
  }

  async createMovement(body: CreateInventoryMovementPayload): Promise<InventoryMovement> {
    const headers = this.buildHeaders(body.workspaceId);
    const res = await this.post<InventoryMovementResponse, CreateInventoryMovementPayload>(
      "/inventory/internal/movements",
      body,
      headers
    );
    return res?.data as InventoryMovement;
  }

  async listMovements(
    workspaceId: string,
    query: ListInventoryMovementsQuery = {}
  ): Promise<InventoryMovement[]> {
    const headers = this.buildHeaders(workspaceId);
    const fullQuery: HttpQuery = { workspaceId, ...query };
    const res = await this.get<InventoryMovementListResponse>(
      "/inventory/internal/movements",
      fullQuery,
      headers
    );
    return res?.data ?? [];
  }

  async getAlerts(workspaceId: string): Promise<InventoryAlertsResponse> {
    const headers = this.buildHeaders(workspaceId);
    const query: HttpQuery = { workspaceId };
    return this.get<InventoryAlertsResponse>("/inventory/internal/alerts", query, headers);
  }

  async getSettings(workspaceId: string): Promise<InventoryWorkspaceSettingsBundle> {
    const headers = this.buildHeaders(workspaceId);
    const query: HttpQuery = { workspaceId };
    const res = await this.get<InventorySettingsResponse>(
      "/inventory/internal/settings",
      query,
      headers
    );
    return res?.data as InventoryWorkspaceSettingsBundle;
  }

  async upsertSettings(
    payload: UpsertInventorySettingsRequest
  ): Promise<InventoryWorkspaceSettingsBundle> {
    const headers = this.buildHeaders(payload.workspaceId);
    const res = await this.put<InventorySettingsResponse, UpsertInventorySettingsRequest>(
      "/inventory/internal/settings",
      payload,
      headers
    );
    return res?.data as InventoryWorkspaceSettingsBundle;
  }
}

export default InventoryApi;
