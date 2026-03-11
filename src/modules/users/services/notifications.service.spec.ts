jest.mock("./notifications-api", () => ({
  UsersNotificationsApi: jest.fn(),
}));

jest.mock("@modules/company/services/company.service", () => ({
  companyService: {
    getWorkspaceValue: jest.fn(),
  },
}));

import { UsersNotificationsApi } from "./notifications-api";
import { UsersNotificationsService } from "./notifications.service";
import { companyService } from "@modules/company/services/company.service";

type NotificationsApiMock = {
  list: jest.Mock;
  getSummary: jest.Mock;
  markRead: jest.Mock;
  markAllRead: jest.Mock;
  archive: jest.Mock;
};

function createApiMock(): NotificationsApiMock {
  return {
    list: jest.fn().mockResolvedValue({
      workspaceId: "ws-1",
      summary: {
        unreadCount: 3,
        highPriorityUnreadCount: 1,
        totalActive: 7,
      },
      page: { limit: 20, offset: 0, total: 7, hasMore: false },
      items: [],
    }),
    getSummary: jest.fn().mockResolvedValue({
      workspaceId: "ws-1",
      summary: {
        unreadCount: 2,
        highPriorityUnreadCount: 1,
        totalActive: 6,
      },
    }),
    markRead: jest.fn().mockResolvedValue({
      workspaceId: "ws-1",
      notification: { id: "n-1", isRead: true },
    }),
    markAllRead: jest.fn().mockResolvedValue({
      workspaceId: "ws-1",
      updatedCount: 5,
    }),
    archive: jest.fn().mockResolvedValue({
      workspaceId: "ws-1",
      notification: { id: "n-2", isActive: false },
    }),
  };
}

describe("UsersNotificationsService", () => {
  const notificationsApiCtor = jest.mocked(UsersNotificationsApi);
  const mockedCompanyService = jest.mocked(companyService);
  let apiMock: NotificationsApiMock;

  beforeEach(() => {
    jest.clearAllMocks();
    apiMock = createApiMock();
    notificationsApiCtor.mockImplementation(() => apiMock as unknown as UsersNotificationsApi);
    mockedCompanyService.getWorkspaceValue.mockReturnValue({ workspaceId: "workspace-1" } as never);
  });

  it("starts with empty summary and supports reset", () => {
    const service = new UsersNotificationsService();

    expect(service.getSummaryValue()).toEqual({
      unreadCount: 0,
      highPriorityUnreadCount: 0,
      totalActive: 0,
      lastGeneratedAt: null,
    });

    service.resetSummary();
    expect(service.getSummaryValue().unreadCount).toBe(0);
  });

  it("exposes summary observable stream", async () => {
    const service = new UsersNotificationsService();
    const snapshots: number[] = [];
    const sub = service.getSummary$().subscribe((summary) => snapshots.push(summary.unreadCount));

    await service.fetchSummary({ workspaceId: "ws-1" });
    sub.unsubscribe();

    expect(snapshots.length).toBeGreaterThanOrEqual(2);
    expect(snapshots[snapshots.length - 1]).toBe(2);
  });

  it("fetches summary and publishes latest values", async () => {
    const service = new UsersNotificationsService();

    const response = await service.fetchSummary({ workspaceId: " ws-1 " });

    expect(response.workspaceId).toBe("ws-1");
    expect(apiMock.getSummary).toHaveBeenCalledWith("ws-1");
    expect(service.getSummaryValue()).toEqual({
      unreadCount: 2,
      highPriorityUnreadCount: 1,
      totalActive: 6,
    });
  });

  it("publishes empty summary when api summary payload is missing", async () => {
    apiMock.getSummary.mockResolvedValueOnce({
      workspaceId: "ws-1",
      summary: undefined,
    });
    const service = new UsersNotificationsService();

    await service.fetchSummary({ workspaceId: "ws-1" });

    expect(service.getSummaryValue()).toEqual({
      unreadCount: 0,
      highPriorityUnreadCount: 0,
      totalActive: 0,
      lastGeneratedAt: null,
    });
  });

  it("lists notifications using workspace fallback from company service", async () => {
    const service = new UsersNotificationsService();

    const response = await service.list({ unreadOnly: true, limit: 10 });

    expect(response.page.limit).toBe(20);
    expect(apiMock.list).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: "workspace-1",
        unreadOnly: true,
        limit: 10,
      })
    );
    expect(service.getSummaryValue().unreadCount).toBe(3);
  });

  it("markRead, markAllRead and archive refresh summary after write actions", async () => {
    const service = new UsersNotificationsService();

    const notification = await service.markRead("n-1", true, { workspaceId: "ws-1" });
    const updatedCount = await service.markAllRead({ workspaceId: "ws-1" });
    const archived = await service.archive("n-2", { workspaceId: "ws-1" });

    expect(notification).toEqual({ id: "n-1", isRead: true });
    expect(updatedCount).toBe(5);
    expect(archived).toEqual({ id: "n-2", isActive: false });
    expect(apiMock.getSummary).toHaveBeenCalledTimes(3);
    expect(apiMock.getSummary).toHaveBeenCalledWith("ws-1");
  });

  it("wraps fetchSummary/markRead/markAllRead/archive errors into AppError", async () => {
    const service = new UsersNotificationsService();

    apiMock.getSummary.mockRejectedValueOnce(new Error("summary-failure"));
    await expect(service.fetchSummary()).rejects.toMatchObject({
      message: "summary-failure",
      kind: "Unknown",
    });

    apiMock.markRead.mockRejectedValueOnce(new Error("mark-read-failure"));
    await expect(service.markRead("n-1", true)).rejects.toMatchObject({
      message: "mark-read-failure",
      kind: "Unknown",
    });

    apiMock.markAllRead.mockRejectedValueOnce(new Error("mark-all-failure"));
    await expect(service.markAllRead()).rejects.toMatchObject({
      message: "mark-all-failure",
      kind: "Unknown",
    });

    apiMock.archive.mockRejectedValueOnce(new Error("archive-failure"));
    await expect(service.archive("n-1")).rejects.toMatchObject({
      message: "archive-failure",
      kind: "Unknown",
    });
  });

  it("wraps errors into AppError", async () => {
    apiMock.list.mockRejectedValueOnce(new Error("notifications-list-failure"));
    const service = new UsersNotificationsService();

    await expect(service.list()).rejects.toMatchObject({
      message: "notifications-list-failure",
      kind: "Unknown",
    });
  });
});
