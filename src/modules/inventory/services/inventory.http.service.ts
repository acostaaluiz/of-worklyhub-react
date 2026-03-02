import { toAppError } from "@core/errors/to-app-error";
import { httpClient } from "@core/http/client.instance";
import InventoryApi, {
  type CreateInventoryItemPayload,
  type CreateInventoryMovementPayload,
  type InventoryAlertsResponse,
  type InventoryItem,
  type InventoryMovement,
  type ListInventoryMovementsQuery,
} from "./inventory-api";

export class InventoryHttpService {
  private readonly api = new InventoryApi(httpClient);

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

  async updateItem(
    id: string,
    patch: Partial<CreateInventoryItemPayload> & { workspaceId?: string }
  ): Promise<InventoryItem> {
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

  async createMovement(payload: CreateInventoryMovementPayload): Promise<InventoryMovement> {
    try {
      return await this.api.createMovement(payload);
    } catch (err) {
      throw toAppError(err);
    }
  }

  async listMovements(
    workspaceId: string,
    query: ListInventoryMovementsQuery = {}
  ): Promise<InventoryMovement[]> {
    try {
      return await this.api.listMovements(workspaceId, query);
    } catch (err) {
      throw toAppError(err);
    }
  }

  async getAlerts(workspaceId: string): Promise<InventoryAlertsResponse> {
    try {
      return await this.api.getAlerts(workspaceId);
    } catch (err) {
      throw toAppError(err);
    }
  }
}

export const inventoryHttpService = new InventoryHttpService();

export async function createInventoryItem(
  payload: CreateInventoryItemPayload
): Promise<InventoryItem> {
  return inventoryHttpService.createItem(payload);
}

export async function listInventoryItems(workspaceId: string): Promise<InventoryItem[]> {
  return inventoryHttpService.listItems(workspaceId);
}

export async function getInventoryItem(
  id: string,
  workspaceId?: string
): Promise<InventoryItem | null> {
  return inventoryHttpService.getItem(id, workspaceId);
}

export async function updateInventoryItem(
  id: string,
  patch: Partial<CreateInventoryItemPayload> & { workspaceId?: string }
): Promise<InventoryItem> {
  return inventoryHttpService.updateItem(id, patch);
}

export async function deleteInventoryItem(id: string, workspaceId?: string): Promise<void> {
  return inventoryHttpService.deleteItem(id, workspaceId);
}

export async function createInventoryMovement(
  payload: CreateInventoryMovementPayload
): Promise<InventoryMovement> {
  return inventoryHttpService.createMovement(payload);
}

export async function listInventoryMovements(
  workspaceId: string,
  query: ListInventoryMovementsQuery = {}
): Promise<InventoryMovement[]> {
  return inventoryHttpService.listMovements(workspaceId, query);
}

export async function getInventoryAlerts(
  workspaceId: string
): Promise<InventoryAlertsResponse> {
  return inventoryHttpService.getAlerts(workspaceId);
}

export default inventoryHttpService;

