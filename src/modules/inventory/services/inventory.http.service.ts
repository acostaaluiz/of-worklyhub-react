import { httpClient } from "@core/http/client.instance";
import type { HttpClient } from "@core/http/interfaces/http-client.interface";
import { toAppError } from "@core/errors/to-app-error";
import InventoryApi, { CreateInventoryItemPayload, InventoryItem } from "./inventory-api";

const api = new InventoryApi(httpClient as unknown as HttpClient);

export async function createInventoryItem(payload: CreateInventoryItemPayload): Promise<InventoryItem> {
  try {
    const created = await api.createItem(payload);
    return created;
  } catch (err) {
    throw toAppError(err);
  }
}

export async function listInventoryItems(workspaceId: string): Promise<InventoryItem[]> {
  try {
    return await api.listItems(workspaceId);
  } catch (err) {
    throw toAppError(err);
  }
}

export async function getInventoryItem(id: string, workspaceId?: string): Promise<InventoryItem | null> {
  try {
    return await api.getItem(id, workspaceId);
  } catch (err) {
    throw toAppError(err);
  }
}

export async function updateInventoryItem(id: string, patch: Partial<CreateInventoryItemPayload>): Promise<InventoryItem> {
  try {
    return await api.updateItem(id, patch);
  } catch (err) {
    throw toAppError(err);
  }
}

export async function deleteInventoryItem(id: string, workspaceId?: string): Promise<void> {
  try {
    await api.deleteItem(id, workspaceId);
  } catch (err) {
    throw toAppError(err);
  }
}

export default {
  createInventoryItem,
  listInventoryItems,
  getInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
};
