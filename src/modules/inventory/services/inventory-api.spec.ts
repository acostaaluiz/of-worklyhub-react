import type { HttpClient } from "@core/http/interfaces/http-client.interface";
import { InventoryApi } from "./inventory-api";

function createApi(response: DataValue) {
  const request = jest.fn().mockResolvedValue({ data: response });
  const http = { request } as unknown as HttpClient;
  const api = new InventoryApi(http);
  return { api, request };
}

describe("InventoryApi", () => {
  it("handles item CRUD endpoints", async () => {
    const { api, request } = createApi({
      data: { id: "item-1", workspaceId: "ws-1", name: "Anesthetic" },
    });

    await api.createItem({
      workspaceId: "ws-1",
      name: "Anesthetic",
    });
    await api.listItems("ws-1");
    await api.getItem("item-1", "ws-1");
    await api.updateItem("item-1", { workspaceId: "ws-1", quantity: 10 });
    await api.deleteItem("item-1", "ws-1");

    expect(request.mock.calls[0][0]).toMatchObject({
      method: "POST",
      url: "/inventory/internal/items",
      headers: expect.objectContaining({
        "x-workspace-id": "ws-1",
      }),
    });
    expect(request.mock.calls[1][0]).toMatchObject({
      method: "GET",
      url: "/inventory/internal/items",
      query: { workspaceId: "ws-1" },
    });
    expect(request.mock.calls[4][0]).toMatchObject({
      method: "DELETE",
      url: "/inventory/internal/items/item-1",
      query: { workspaceId: "ws-1" },
    });
  });

  it("handles movement, alerts and settings endpoints", async () => {
    const { api, request } = createApi({
      data: [],
    });

    await api.createMovement({
      workspaceId: "ws-1",
      inventoryItemId: "item-1",
      direction: "in",
      quantity: 5,
    });
    await api.listMovements("ws-1", { direction: "out", limit: 10 });
    await api.getAlerts("ws-1");
    await api.getSettings("ws-1");
    await api.upsertSettings({
      workspaceId: "ws-1",
      settings: { defaultMinQuantity: 3 },
      updatedBy: "user-1",
    });

    expect(request.mock.calls[0][0]).toMatchObject({
      method: "POST",
      url: "/inventory/internal/movements",
    });
    expect(request.mock.calls[1][0]).toMatchObject({
      method: "GET",
      url: "/inventory/internal/movements",
      query: { workspaceId: "ws-1", direction: "out", limit: 10 },
    });
    expect(request.mock.calls[2][0].url).toBe("/inventory/internal/alerts");
    expect(request.mock.calls[3][0].url).toBe("/inventory/internal/settings");
    expect(request.mock.calls[4][0]).toMatchObject({
      method: "PUT",
      url: "/inventory/internal/settings",
    });
  });
});

