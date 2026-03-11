import type { HttpClient } from "@core/http/interfaces/http-client.interface";
import { UsersNotificationsApi } from "./notifications-api";

function createApi(response: DataValue) {
  const request = jest.fn().mockResolvedValue({ data: response });
  const http = { request } as unknown as HttpClient;
  const api = new UsersNotificationsApi(http);
  return { api, request };
}

describe("UsersNotificationsApi", () => {
  it("lists notifications with query and workspace header", async () => {
    const payload = {
      workspaceId: "ws-1",
      summary: { unreadCount: 2, highPriorityUnreadCount: 1, totalActive: 4 },
      page: { limit: 20, offset: 0, total: 4, hasMore: false },
      items: [],
    };
    const { api, request } = createApi(payload);

    const result = await api.list({
      workspaceId: "ws-1",
      limit: 20,
      offset: 0,
      unreadOnly: true,
      includeInactive: true,
    });

    expect(result.workspaceId).toBe("ws-1");
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        url: "users/internal/users/notifications",
        query: {
          workspaceId: "ws-1",
          limit: 20,
          offset: 0,
          unreadOnly: "true",
          includeInactive: "true",
        },
        headers: {
          Accept: "application/json",
          "x-workspace-id": "ws-1",
        },
      })
    );
  });

  it("gets summary with optional workspace header", async () => {
    const { api, request } = createApi({
      workspaceId: "ws-2",
      summary: { unreadCount: 0, highPriorityUnreadCount: 0, totalActive: 0 },
    });

    await api.getSummary("ws-2");
    await api.getSummary();

    expect(request.mock.calls[0][0]).toMatchObject({
      method: "GET",
      url: "users/internal/users/notifications/summary",
      query: { workspaceId: "ws-2" },
      headers: {
        Accept: "application/json",
        "x-workspace-id": "ws-2",
      },
    });

    expect(request.mock.calls[1][0]).toMatchObject({
      method: "GET",
      url: "users/internal/users/notifications/summary",
      headers: {
        Accept: "application/json",
      },
    });
  });

  it("updates read/archive states and marks all as read", async () => {
    const { api, request } = createApi({
      workspaceId: "ws-1",
      updatedCount: 3,
      notification: { id: "n-1" },
    });

    await api.markRead("n-1", { read: true }, "ws-1");
    await api.markAllRead("ws-1");
    await api.archive("n-1", "ws-1");

    expect(request.mock.calls[0][0]).toMatchObject({
      method: "PATCH",
      url: "users/internal/users/notifications/n-1/read",
      body: { read: true },
    });

    expect(request.mock.calls[1][0]).toMatchObject({
      method: "POST",
      url: "users/internal/users/notifications/read-all",
      body: {},
    });

    expect(request.mock.calls[2][0]).toMatchObject({
      method: "PATCH",
      url: "users/internal/users/notifications/n-1/archive",
      body: {},
    });
  });
});

