/* eslint-disable @typescript-eslint/no-explicit-any */
import { WorkOrderApi } from "./work-order-api";

function createApi(response: DataValue) {
  const request = jest.fn().mockResolvedValue({ data: response });
  const http = { request } as any;
  const api = new WorkOrderApi(http);

  return { api, request };
}

describe("WorkOrderApi", () => {
  it("includes workspace header in requests when workspaceId is provided", async () => {
    const { api, request } = createApi({ data: [] });

    await api.getStatuses("ws-1");

    expect(request.mock.calls[0][0].headers["x-workspace-id"]).toBe("ws-1");
  });

  it("creates statuses and work orders using POST payloads", async () => {
    const createStatusApi = createApi({ data: { id: "status-1" } });
    const createWorkOrderApi = createApi({ data: { id: "wo-1" } });

    await expect(
      createStatusApi.api.createStatus("ws-1", { code: "opened", label: "Opened" } as any)
    ).resolves.toEqual({ id: "status-1" });
    expect(createStatusApi.request.mock.calls[0][0]).toMatchObject({
      method: "POST",
      url: "/work-order/statuses",
      body: { code: "opened", label: "Opened" },
    });

    await expect(
      createWorkOrderApi.api.createWorkOrder("ws-1", { title: "Repair", workspaceId: "ws-1" } as any)
    ).resolves.toEqual({ id: "wo-1" });
    expect(createWorkOrderApi.request.mock.calls[0][0]).toMatchObject({
      method: "POST",
      url: "/work-order/work-orders",
    });
  });

  it("normalizes pagination when list returns a plain array", async () => {
    const { api } = createApi([{ id: "wo-1" }, { id: "wo-2" }, { id: "wo-3" }]);

    const page = await api.listWorkOrders(undefined, { limit: 2, offset: 0 });

    expect(page.data).toHaveLength(3);
    expect(page.pagination.limit).toBe(2);
    expect(page.pagination.offset).toBe(0);
    expect(typeof page.pagination.hasMore).toBe("boolean");
  });

  it("reads pagination from meta/pagination/pageInfo payloads", async () => {
    const withPagination = createApi({
      data: [{ id: "wo-1" }],
      pagination: { limit: 1, offset: 2, total: 10, hasMore: true, nextOffset: 3 },
    });
    const withPageInfo = createApi({
      data: [{ id: "wo-2" }],
      pageInfo: { limit: 1, offset: 0, total: 1, hasMore: false, nextOffset: null },
    });

    const first = await withPagination.api.listWorkOrders("ws-1");
    const second = await withPageInfo.api.listWorkOrders("ws-1", { workspaceId: "custom-ws" } as any);

    expect(first.pagination).toMatchObject({
      limit: 1,
      offset: 2,
      total: 10,
      hasMore: true,
      nextOffset: 3,
    });
    expect(second.data).toHaveLength(1);
    expect(withPageInfo.request.mock.calls[0][0].query.workspaceId).toBe("custom-ws");
  });

  it("falls back to empty list when payload shape is not an array", async () => {
    const { api } = createApi({ data: null });

    const page = await api.listWorkOrders("ws-1", { limit: -1, offset: -2 } as any);

    expect(page.data).toEqual([]);
    expect(page.pagination.limit).toBe(25);
    expect(page.pagination.offset).toBe(0);
  });

  it("gets, updates and deletes work orders", async () => {
    const getApi = createApi({ data: { id: "wo-1" } });
    const updateApi = createApi({ data: { id: "wo-1", title: "Updated" } });
    const deleteApi = createApi(undefined);

    await expect(getApi.api.getWorkOrderById("ws-1", "wo-1")).resolves.toEqual({ id: "wo-1" });
    await expect(
      updateApi.api.updateWorkOrder("ws-1", "wo-1", { title: "Updated" } as any)
    ).resolves.toEqual({ id: "wo-1", title: "Updated" });
    await expect(deleteApi.api.deleteWorkOrder("ws-1", "wo-1")).resolves.toBeUndefined();
    expect(deleteApi.request.mock.calls[0][0].method).toBe("DELETE");
  });

  it("handles overview, history, comments and checklist endpoints", async () => {
    const overviewApi = createApi({ data: { totals: { active: 1 } } });
    const historyApi = createApi({ data: [{ id: "history-1" }] });
    const commentsApi = createApi({ data: [{ id: "comment-1" }] });
    const createCommentApi = createApi({ data: { id: "comment-2" } });
    const checklistApi = createApi({ data: [{ id: "item-1" }] });
    const createChecklistApi = createApi({ data: { id: "item-2" } });
    const updateChecklistApi = createApi({ data: { id: "item-3" } });
    const deleteChecklistApi = createApi(undefined);

    await expect(overviewApi.api.getOverview("ws-1")).resolves.toEqual({ totals: { active: 1 } });
    await expect(historyApi.api.getHistory("ws-1", "wo-1")).resolves.toEqual([{ id: "history-1" }]);
    await expect(commentsApi.api.getComments("ws-1", "wo-1")).resolves.toEqual([{ id: "comment-1" }]);
    await expect(
      createCommentApi.api.createComment("ws-1", "wo-1", { body: "new comment" } as any)
    ).resolves.toEqual({ id: "comment-2" });
    await expect(checklistApi.api.getChecklist("ws-1", "wo-1")).resolves.toEqual([{ id: "item-1" }]);
    await expect(
      createChecklistApi.api.createChecklistItem("ws-1", "wo-1", { title: "Step 1" } as any)
    ).resolves.toEqual({ id: "item-2" });
    await expect(
      updateChecklistApi.api.updateChecklistItem("ws-1", "wo-1", "item-2", { done: true } as any)
    ).resolves.toEqual({ id: "item-3" });
    await expect(
      deleteChecklistApi.api.deleteChecklistItem("ws-1", "wo-1", "item-2")
    ).resolves.toBeUndefined();
  });

  it("handles attachments endpoints", async () => {
    const listAttachmentsApi = createApi({ data: [{ id: "attachment-1" }] });
    const requestUploadSignatureApi = createApi({
      url: "https://upload.example.com",
      path: "work-orders/ws-1/wo-1/user-1/file.jpg",
      expiresAt: "2026-03-07T12:00:00.000Z",
      maxSize: 26214400,
    });
    const createAttachmentApi = createApi({ data: { id: "attachment-2" } });
    const deleteAttachmentApi = createApi(undefined);

    await expect(listAttachmentsApi.api.getAttachments("ws-1", "wo-1")).resolves.toEqual([
      { id: "attachment-1" },
    ]);
    await expect(
      requestUploadSignatureApi.api.requestAttachmentUploadSignature("ws-1", "wo-1", {
        filename: "evidence.jpg",
        contentType: "image/jpeg",
        maxSize: 26214400,
      } as any)
    ).resolves.toMatchObject({
      url: "https://upload.example.com",
      path: "work-orders/ws-1/wo-1/user-1/file.jpg",
    });
    await expect(
      createAttachmentApi.api.createAttachment("ws-1", "wo-1", {
        storagePath: "work-orders/ws-1/wo-1/user-1/file.jpg",
        fileName: "evidence.jpg",
        contentType: "image/jpeg",
      } as any)
    ).resolves.toEqual({ id: "attachment-2" });
    await expect(
      deleteAttachmentApi.api.deleteAttachment("ws-1", "wo-1", "attachment-2")
    ).resolves.toBeUndefined();
  });

  it("covers helper methods through instance access", () => {
    const { api } = createApi({});
    const anyApi = api as any;

    expect(anyApi.toPositiveInt(undefined, 10)).toBe(10);
    expect(anyApi.toPositiveInt(null, 10)).toBe(0);
    expect(anyApi.toPositiveInt("7", 10)).toBe(7);
    expect(anyApi.toPositiveInt(-5, 10)).toBe(10);

    const pagination = anyApi.normalizePagination(
      [{ id: "wo-1" }],
      { limit: undefined, offset: undefined },
      { nextOffset: 5 }
    );
    expect(pagination).toMatchObject({
      limit: 25,
      offset: 0,
      hasMore: true,
      nextOffset: 5,
    });
  });
});


