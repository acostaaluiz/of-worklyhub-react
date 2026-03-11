jest.mock("./inventory-api", () => ({
  __esModule: true,
  default: jest.fn(),
}));

import InventoryApi from "./inventory-api";
import {
  InventoryHttpService,
  createInventoryItem,
  createInventoryMovement,
  deleteInventoryItem,
  getInventoryAlerts,
  getInventoryItem,
  getInventorySettings,
  inventoryHttpService,
  listInventoryItems,
  listInventoryMovements,
  updateInventoryItem,
  upsertInventorySettings,
} from "./inventory.http.service";

type InventoryApiMock = {
  createItem: jest.Mock;
  listItems: jest.Mock;
  getItem: jest.Mock;
  updateItem: jest.Mock;
  deleteItem: jest.Mock;
  createMovement: jest.Mock;
  listMovements: jest.Mock;
  getAlerts: jest.Mock;
  getSettings: jest.Mock;
  upsertSettings: jest.Mock;
};

function createApiMock(): InventoryApiMock {
  return {
    createItem: jest.fn().mockResolvedValue({ id: "item-1" }),
    listItems: jest.fn().mockResolvedValue([{ id: "item-1" }]),
    getItem: jest.fn().mockResolvedValue({ id: "item-1" }),
    updateItem: jest.fn().mockResolvedValue({ id: "item-1", quantity: 12 }),
    deleteItem: jest.fn().mockResolvedValue(undefined),
    createMovement: jest.fn().mockResolvedValue({ id: "move-1" }),
    listMovements: jest.fn().mockResolvedValue([{ id: "move-1" }]),
    getAlerts: jest.fn().mockResolvedValue({ alerts: [] }),
    getSettings: jest.fn().mockResolvedValue({ workspaceId: "ws-1", settings: {} }),
    upsertSettings: jest.fn().mockResolvedValue({ workspaceId: "ws-1", settings: {} }),
  };
}

describe("InventoryHttpService", () => {
  const inventoryApiCtor = jest.mocked(InventoryApi);
  let apiMock: InventoryApiMock;

  beforeEach(() => {
    jest.clearAllMocks();
    apiMock = createApiMock();
    inventoryApiCtor.mockImplementation(() => apiMock as unknown as InventoryApi);
  });

  it("proxies success paths to inventory api", async () => {
    const service = new InventoryHttpService();

    await expect(service.createItem({ workspaceId: "ws-1", name: "Anesthetic" })).resolves.toEqual({
      id: "item-1",
    });
    await expect(service.listItems("ws-1")).resolves.toEqual([{ id: "item-1" }]);
    await expect(service.getItem("item-1", "ws-1")).resolves.toEqual({ id: "item-1" });
    await expect(service.updateItem("item-1", { quantity: 12 })).resolves.toEqual({
      id: "item-1",
      quantity: 12,
    });
    await expect(service.deleteItem("item-1", "ws-1")).resolves.toBeUndefined();
    await expect(
      service.createMovement({
        workspaceId: "ws-1",
        inventoryItemId: "item-1",
        direction: "in",
        quantity: 2,
      })
    ).resolves.toEqual({ id: "move-1" });
    await expect(service.listMovements("ws-1", { limit: 5 })).resolves.toEqual([{ id: "move-1" }]);
    await expect(service.getAlerts("ws-1")).resolves.toEqual({ alerts: [] });
    await expect(service.getSettings("ws-1")).resolves.toEqual({
      workspaceId: "ws-1",
      settings: {},
    });
    await expect(service.upsertSettings("ws-1", { defaultMinQuantity: 3 }, "user-1")).resolves.toEqual({
      workspaceId: "ws-1",
      settings: {},
    });
  });

  it("wraps api errors into AppError", async () => {
    apiMock.listItems.mockRejectedValueOnce(new Error("inventory-http-failure"));
    const service = new InventoryHttpService();

    await expect(service.listItems("ws-1")).rejects.toMatchObject({
      message: "inventory-http-failure",
      kind: "Unknown",
    });
  });

  it("exports helper wrappers bound to singleton service", async () => {
    const createSpy = jest.spyOn(inventoryHttpService, "createItem").mockResolvedValueOnce({ id: "w-1" } as never);
    const listSpy = jest.spyOn(inventoryHttpService, "listItems").mockResolvedValueOnce([{ id: "w-1" }] as never);
    const getSpy = jest.spyOn(inventoryHttpService, "getItem").mockResolvedValueOnce({ id: "w-1" } as never);
    const updateSpy = jest.spyOn(inventoryHttpService, "updateItem").mockResolvedValueOnce({ id: "w-1" } as never);
    const deleteSpy = jest.spyOn(inventoryHttpService, "deleteItem").mockResolvedValueOnce(undefined);
    const createMoveSpy = jest.spyOn(inventoryHttpService, "createMovement").mockResolvedValueOnce({ id: "m-1" } as never);
    const listMoveSpy = jest.spyOn(inventoryHttpService, "listMovements").mockResolvedValueOnce([{ id: "m-1" }] as never);
    const alertsSpy = jest.spyOn(inventoryHttpService, "getAlerts").mockResolvedValueOnce({ alerts: [] } as never);
    const settingsSpy = jest.spyOn(inventoryHttpService, "getSettings").mockResolvedValueOnce({ workspaceId: "ws-1", settings: {} } as never);
    const upsertSpy = jest.spyOn(inventoryHttpService, "upsertSettings").mockResolvedValueOnce({ workspaceId: "ws-1", settings: {} } as never);

    await expect(createInventoryItem({ workspaceId: "ws-1", name: "Item" })).resolves.toEqual({ id: "w-1" });
    await expect(listInventoryItems("ws-1")).resolves.toEqual([{ id: "w-1" }]);
    await expect(getInventoryItem("w-1", "ws-1")).resolves.toEqual({ id: "w-1" });
    await expect(updateInventoryItem("w-1", { quantity: 2 })).resolves.toEqual({ id: "w-1" });
    await expect(deleteInventoryItem("w-1", "ws-1")).resolves.toBeUndefined();
    await expect(
      createInventoryMovement({
        workspaceId: "ws-1",
        inventoryItemId: "w-1",
        direction: "in",
        quantity: 1,
      })
    ).resolves.toEqual({ id: "m-1" });
    await expect(listInventoryMovements("ws-1")).resolves.toEqual([{ id: "m-1" }]);
    await expect(getInventoryAlerts("ws-1")).resolves.toEqual({ alerts: [] });
    await expect(getInventorySettings("ws-1")).resolves.toEqual({
      workspaceId: "ws-1",
      settings: {},
    });
    await expect(upsertInventorySettings("ws-1", { defaultIsActive: true })).resolves.toEqual({
      workspaceId: "ws-1",
      settings: {},
    });

    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(createMoveSpy).toHaveBeenCalledTimes(1);
    expect(listMoveSpy).toHaveBeenCalledTimes(1);
    expect(alertsSpy).toHaveBeenCalledTimes(1);
    expect(settingsSpy).toHaveBeenCalledTimes(1);
    expect(upsertSpy).toHaveBeenCalledTimes(1);
  });
});

