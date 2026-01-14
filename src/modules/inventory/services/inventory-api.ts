import { BaseHttpService } from "@core/http/base-http.service";
import type { HttpClient } from "@core/http/interfaces/http-client.interface";

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

export type InventoryListResponse = { data: InventoryItem[] };
export type InventoryItemResponse = { data: InventoryItem };

export class InventoryApi extends BaseHttpService {
  constructor(http: HttpClient) {
    super(http, { correlationNamespace: "inventory-api" });
  }

  async createItem(body: CreateInventoryItemPayload): Promise<InventoryItem> {
    const res = await this.post<InventoryItemResponse, CreateInventoryItemPayload>(
      "/inventory/internal/items",
      body
    );
    return res?.data as InventoryItem;
  }

  async listItems(workspaceId: string): Promise<InventoryItem[]> {
    const q: Record<string, unknown> = { workspaceId };
    const res = await this.get<InventoryListResponse>("/inventory/internal/items", q);
    return res?.data ?? [];
  }

  async getItem(id: string, workspaceId?: string): Promise<InventoryItem | null> {
    const q: Record<string, unknown> = {};
    if (workspaceId) q.workspaceId = workspaceId;
    const res = await this.get<InventoryItemResponse>(`/inventory/internal/items/${id}`, q);
    return res?.data ?? null;
  }

  async updateItem(id: string, body: Partial<CreateInventoryItemPayload>): Promise<InventoryItem> {
    const res = await this.patch<InventoryItemResponse, Partial<CreateInventoryItemPayload>>(
      `/inventory/internal/items/${id}`,
      body
    );
    return res?.data as InventoryItem;
  }

  async deleteItem(id: string, workspaceId?: string): Promise<void> {
    const q: Record<string, unknown> = {};
    if (workspaceId) q.workspaceId = workspaceId;
    await this.delete<void>(`/inventory/internal/items/${id}`, q);
  }
}

export default InventoryApi;
