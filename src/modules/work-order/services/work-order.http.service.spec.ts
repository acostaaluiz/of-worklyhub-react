/* eslint-disable @typescript-eslint/no-explicit-any */
jest.mock("@core/errors/to-app-error", () => ({
  toAppError: jest.fn((error) => error),
}));

jest.mock("@modules/work-order/services/work-order-api", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({})),
}));

import { toAppError } from "@core/errors/to-app-error";
import * as serviceModule from "./work-order.http.service";

type WorkOrderApiMock = {
  getStatuses: jest.Mock;
  createStatus: jest.Mock;
  listWorkOrders: jest.Mock;
  getWorkOrderById: jest.Mock;
  createWorkOrder: jest.Mock;
  updateWorkOrder: jest.Mock;
  deleteWorkOrder: jest.Mock;
  getOverview: jest.Mock;
  getHistory: jest.Mock;
  getComments: jest.Mock;
  createComment: jest.Mock;
  getChecklist: jest.Mock;
  createChecklistItem: jest.Mock;
  updateChecklistItem: jest.Mock;
  deleteChecklistItem: jest.Mock;
};

function createApiMock(): WorkOrderApiMock {
  return {
    getStatuses: jest.fn().mockResolvedValue([{ id: "status-1" }]),
    createStatus: jest.fn().mockResolvedValue({ id: "status-1" }),
    listWorkOrders: jest
      .fn()
      .mockResolvedValue({ data: [{ id: "wo-1" }], pagination: { limit: 25, offset: 0, total: 1, hasMore: false, nextOffset: null } }),
    getWorkOrderById: jest.fn().mockResolvedValue({ id: "wo-1" }),
    createWorkOrder: jest.fn().mockResolvedValue({ id: "wo-created" }),
    updateWorkOrder: jest.fn().mockResolvedValue({ id: "wo-updated" }),
    deleteWorkOrder: jest.fn().mockResolvedValue(undefined),
    getOverview: jest.fn().mockResolvedValue({ totals: { active: 1 } }),
    getHistory: jest.fn().mockResolvedValue([{ id: "history-1" }]),
    getComments: jest.fn().mockResolvedValue([{ id: "comment-1" }]),
    createComment: jest.fn().mockResolvedValue({ id: "comment-2" }),
    getChecklist: jest.fn().mockResolvedValue([{ id: "item-1" }]),
    createChecklistItem: jest.fn().mockResolvedValue({ id: "item-2" }),
    updateChecklistItem: jest.fn().mockResolvedValue({ id: "item-3" }),
    deleteChecklistItem: jest.fn().mockResolvedValue(undefined),
  };
}

describe("WorkOrderHttpService", () => {
  let apiMock: WorkOrderApiMock;
  let service: serviceModule.WorkOrderHttpService;

  beforeEach(() => {
    jest.clearAllMocks();
    apiMock = createApiMock();
    service = new serviceModule.WorkOrderHttpService();
    (service as any).api = apiMock;
  });

  it("lists statuses and wraps errors with toAppError", async () => {
    await expect(service.listStatuses("ws-1")).resolves.toEqual([{ id: "status-1" }]);

    apiMock.getStatuses.mockRejectedValueOnce(new Error("statuses-failure"));
    await expect(service.listStatuses("ws-1")).rejects.toThrow("statuses-failure");
    expect(toAppError).toHaveBeenCalled();
  });

  it("creates statuses and pages work orders", async () => {
    await expect(service.createStatus("ws-1", { code: "opened", label: "Opened" } as any)).resolves.toEqual({
      id: "status-1",
    });
    await expect(service.listWorkOrdersPage("ws-1", { limit: 10 } as any)).resolves.toMatchObject({
      data: [{ id: "wo-1" }],
    });
    await expect(service.listWorkOrders("ws-1", { limit: 10 } as any)).resolves.toEqual([
      { id: "wo-1" },
    ]);
  });

  it("creates and updates work orders only when workspace can be resolved", async () => {
    await expect(
      service.createWorkOrder(undefined, { workspaceId: undefined } as any)
    ).rejects.toThrow("workspaceId is required");
    await expect(
      service.updateWorkOrder(undefined, "wo-1", { workspaceId: undefined } as any)
    ).rejects.toThrow("workspaceId is required");

    await expect(
      service.createWorkOrder(undefined, { workspaceId: "ws-1", title: "New" } as any)
    ).resolves.toEqual({ id: "wo-created" });
    expect(apiMock.createWorkOrder).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({ workspaceId: "ws-1" })
    );

    await expect(
      service.updateWorkOrder("ws-1", "wo-1", { title: "Updated" } as any)
    ).resolves.toEqual({ id: "wo-updated" });
    expect(apiMock.updateWorkOrder).toHaveBeenCalledWith(
      "ws-1",
      "wo-1",
      expect.objectContaining({ workspaceId: "ws-1" })
    );
  });

  it("gets and deletes work orders", async () => {
    await expect(service.getWorkOrderById("ws-1", "wo-1")).resolves.toEqual({ id: "wo-1" });
    await expect(service.deleteWorkOrder("ws-1", "wo-1")).resolves.toBeUndefined();
  });

  it("requires workspace for overview, history, comments and checklist methods", async () => {
    await expect(service.getOverview(undefined)).rejects.toThrow("workspaceId is required");
    await expect(service.listHistory(undefined, "wo-1")).rejects.toThrow("workspaceId is required");
    await expect(service.listComments(undefined, "wo-1")).rejects.toThrow("workspaceId is required");
    await expect(service.createComment(undefined, "wo-1", { body: "x" } as any)).rejects.toThrow(
      "workspaceId is required"
    );
    await expect(service.listChecklist(undefined, "wo-1")).rejects.toThrow("workspaceId is required");
    await expect(
      service.createChecklistItem(undefined, "wo-1", { title: "step" } as any)
    ).rejects.toThrow("workspaceId is required");
    await expect(
      service.updateChecklistItem(undefined, "wo-1", "item-1", { done: true } as any)
    ).rejects.toThrow("workspaceId is required");
    await expect(service.deleteChecklistItem(undefined, "wo-1", "item-1")).rejects.toThrow(
      "workspaceId is required"
    );
  });

  it("delegates overview, history, comments and checklist methods when workspace exists", async () => {
    await expect(service.getOverview("ws-1")).resolves.toEqual({ totals: { active: 1 } });
    await expect(service.listHistory("ws-1", "wo-1")).resolves.toEqual([{ id: "history-1" }]);
    await expect(service.listComments("ws-1", "wo-1")).resolves.toEqual([{ id: "comment-1" }]);
    await expect(
      service.createComment("ws-1", "wo-1", { body: "new comment" } as any)
    ).resolves.toEqual({ id: "comment-2" });
    await expect(service.listChecklist("ws-1", "wo-1")).resolves.toEqual([{ id: "item-1" }]);
    await expect(
      service.createChecklistItem("ws-1", "wo-1", { title: "Step" } as any)
    ).resolves.toEqual({ id: "item-2" });
    await expect(
      service.updateChecklistItem("ws-1", "wo-1", "item-1", { done: true } as any)
    ).resolves.toEqual({ id: "item-3" });
    await expect(service.deleteChecklistItem("ws-1", "wo-1", "item-1")).resolves.toBeUndefined();
  });
});

describe("work-order.http.service exported functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("delegates all exported helpers to workOrderHttpService instance", async () => {
    const spyMap: Array<{
      method: keyof serviceModule.WorkOrderHttpService;
      call: () => Promise<unknown>;
      expected: unknown;
    }> = [
      {
        method: "listStatuses",
        call: () => serviceModule.listWorkOrderStatuses("ws-1"),
        expected: [{ id: "status-1" }],
      },
      {
        method: "createStatus",
        call: () => serviceModule.createWorkOrderStatus("ws-1", {} as any),
        expected: { id: "status-2" },
      },
      {
        method: "listWorkOrders",
        call: () => serviceModule.listWorkOrders("ws-1"),
        expected: [{ id: "wo-1" }],
      },
      {
        method: "listWorkOrdersPage",
        call: () => serviceModule.listWorkOrdersPage("ws-1"),
        expected: { data: [{ id: "wo-1" }] },
      },
      {
        method: "getWorkOrderById",
        call: () => serviceModule.getWorkOrderById("ws-1", "wo-1"),
        expected: { id: "wo-1" },
      },
      {
        method: "createWorkOrder",
        call: () => serviceModule.createWorkOrder("ws-1", {} as any),
        expected: { id: "wo-created" },
      },
      {
        method: "updateWorkOrder",
        call: () => serviceModule.updateWorkOrder("ws-1", "wo-1", {} as any),
        expected: { id: "wo-updated" },
      },
      {
        method: "deleteWorkOrder",
        call: () => serviceModule.deleteWorkOrder("ws-1", "wo-1"),
        expected: undefined,
      },
      {
        method: "getOverview",
        call: () => serviceModule.listWorkOrderOverview("ws-1"),
        expected: { totals: { active: 1 } },
      },
      {
        method: "listHistory",
        call: () => serviceModule.listWorkOrderHistory("ws-1", "wo-1"),
        expected: [{ id: "history-1" }],
      },
      {
        method: "listComments",
        call: () => serviceModule.listWorkOrderComments("ws-1", "wo-1"),
        expected: [{ id: "comment-1" }],
      },
      {
        method: "createComment",
        call: () => serviceModule.createWorkOrderComment("ws-1", "wo-1", {} as any),
        expected: { id: "comment-2" },
      },
      {
        method: "listChecklist",
        call: () => serviceModule.listWorkOrderChecklist("ws-1", "wo-1"),
        expected: [{ id: "item-1" }],
      },
      {
        method: "createChecklistItem",
        call: () => serviceModule.createWorkOrderChecklistItem("ws-1", "wo-1", {} as any),
        expected: { id: "item-2" },
      },
      {
        method: "updateChecklistItem",
        call: () => serviceModule.updateWorkOrderChecklistItem("ws-1", "wo-1", "item-1", {} as any),
        expected: { id: "item-3" },
      },
      {
        method: "deleteChecklistItem",
        call: () => serviceModule.deleteWorkOrderChecklistItem("ws-1", "wo-1", "item-1"),
        expected: undefined,
      },
    ];

    for (const item of spyMap) {
      jest
        .spyOn(serviceModule.workOrderHttpService, item.method as never)
        .mockResolvedValue(item.expected as never);
      await expect(item.call()).resolves.toEqual(item.expected);
    }
  });
});


