import { httpClient } from "@core/http/client.instance";
import { toAppError } from "@core/errors/to-app-error";
import InventoryApi, { CreateInventoryItemPayload, InventoryItem } from "./inventory-api";

/**
 * HTTP wrapper for Inventory API.
 * Follows the same pattern as other modules: expose a service class that
 * wraps the lower-level Api class and converts errors to AppError.
 */
export class InventoryHttpService {
  private api = new InventoryApi(httpClient);

  async createItem(payload: CreateInventoryItemPayload): Promise<InventoryItem> {
    try {
      return await this.api.createItem(payload);
    } catch (err) {
      throw toAppError(err);
    }
  }

  async listItems(workspaceId: string): Promise<InventoryItem[]> {
    try {
      return await this.api.listItems(workspaceId);
    } catch (err) {
      throw toAppError(err);
    }
  }

  async getItem(id: string, workspaceId?: string): Promise<InventoryItem | null> {
    try {
      return await this.api.getItem(id, workspaceId);
    } catch (err) {
      throw toAppError(err);
    }
  }

  async updateItem(id: string, patch: Partial<CreateInventoryItemPayload>): Promise<InventoryItem> {
    try {
      return await this.api.updateItem(id, patch);
    } catch (err) {
      throw toAppError(err);
    }
  }

  async deleteItem(id: string, workspaceId?: string): Promise<void> {
    try {
      await this.api.deleteItem(id, workspaceId);
    } catch (err) {
      throw toAppError(err);
    }
  }
}

export const inventoryHttpService = new InventoryHttpService();

// Backwards-compatible named functions (some modules import these directly)
export async function createInventoryItem(payload: CreateInventoryItemPayload): Promise<InventoryItem> {
  return inventoryHttpService.createItem(payload);
}

export async function listInventoryItems(workspaceId: string): Promise<InventoryItem[]> {
  return inventoryHttpService.listItems(workspaceId);
}

export async function getInventoryItem(id: string, workspaceId?: string): Promise<InventoryItem | null> {
  return inventoryHttpService.getItem(id, workspaceId);
}

export async function updateInventoryItem(id: string, patch: Partial<CreateInventoryItemPayload>): Promise<InventoryItem> {
  return inventoryHttpService.updateItem(id, patch);
}

export async function deleteInventoryItem(id: string, workspaceId?: string): Promise<void> {
  return inventoryHttpService.deleteItem(id, workspaceId);
}

export default inventoryHttpService;
