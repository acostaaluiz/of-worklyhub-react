jest.mock("./slas-api", () => ({
  SlasApi: jest.fn(),
}));

import { SlasApi } from "./slas-api";
import { SlasService } from "./slas.service";

type SlasApiMock = {
  listWorkspaceSlas: jest.Mock;
};

function createApiMock(): SlasApiMock {
  return {
    listWorkspaceSlas: jest.fn().mockResolvedValue({
      slas: [
        {
          id: "sla-1",
          workspace_id: "ws-1",
          user_uid: "user-1",
          event_id: "event-1",
          work_date: "2026-03-09",
          duration_minutes: 90,
          created_at: "2026-03-09T10:00:00.000Z",
        },
        {
          id: "sla-2",
          workspace_id: "ws-1",
          user_uid: "user-1",
          event_id: "event-2",
          work_date: "2026-03-09",
          duration_minutes: 30,
          created_at: "2026-03-09T11:00:00.000Z",
        },
        {
          id: "sla-3",
          workspace_id: "ws-1",
          user_uid: "user-2",
          event_id: "event-3",
          work_date: "2026-03-10",
          duration_minutes: 60,
          created_at: "2026-03-10T09:00:00.000Z",
        },
      ],
    }),
  };
}

describe("SlasService", () => {
  const slasApiCtor = jest.mocked(SlasApi);
  let apiMock: SlasApiMock;

  beforeEach(() => {
    jest.clearAllMocks();
    apiMock = createApiMock();
    slasApiCtor.mockImplementation(() => apiMock as unknown as SlasApi);
  });

  it("lists and maps SLA records from API", async () => {
    const service = new SlasService();

    const rows = await service.list("ws-1", {
      from: "2026-03-01",
      to: "2026-03-31",
    });

    expect(rows).toHaveLength(3);
    expect(rows[0]).toMatchObject({
      id: "sla-1",
      workspaceId: "ws-1",
      userUid: "user-1",
      durationMinutes: 90,
    });
  });

  it("aggregates summary by user and work date", async () => {
    const service = new SlasService();

    const summary = await service.getSummary("ws-1");

    expect(summary).toEqual([
      {
        userUid: "user-2",
        workDate: "2026-03-10",
        totalMinutes: 60,
        totalHours: 1,
      },
      {
        userUid: "user-1",
        workDate: "2026-03-09",
        totalMinutes: 120,
        totalHours: 2,
      },
    ]);
  });

  it("wraps list and summary errors into AppError", async () => {
    apiMock.listWorkspaceSlas.mockRejectedValueOnce(new Error("sla-failure"));
    const service = new SlasService();
    await expect(service.list("ws-1")).rejects.toMatchObject({
      message: "sla-failure",
      kind: "Unknown",
    });

    apiMock.listWorkspaceSlas.mockRejectedValueOnce(new Error("sla-summary-failure"));
    await expect(service.getSummary("ws-1")).rejects.toMatchObject({
      message: "sla-summary-failure",
      kind: "Unknown",
    });
  });
});

