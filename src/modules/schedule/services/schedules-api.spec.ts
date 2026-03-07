/* eslint-disable @typescript-eslint/no-explicit-any */
import { SchedulesApi } from "./schedules-api";

function createApi(returnValue: DataValue) {
  const request = jest.fn().mockResolvedValue({ data: returnValue });
  const http = { request } as any;
  const api = new SchedulesApi(http);

  return { api, request };
}

describe("SchedulesApi", () => {
  it("builds query with every optional field in listSchedulesWithMeta", async () => {
    const payload = {
      data: [{ id: "schedule-1" }],
      meta: { monthViewHint: { title: "Dense month" } },
    };
    const { api, request } = createApi(payload);

    const result = await api.listSchedulesWithMeta("ws-1", {
      from: "2026-01-01",
      to: "2026-01-31",
      calendarView: "month",
      includeViewHint: true,
      monthCellVisibleLimit: 4,
      monthViewTimeZone: "America/Sao_Paulo",
    });

    expect(result).toEqual(payload);
    expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0][0]).toMatchObject({
      method: "GET",
      url: "/schedule/internal/schedules",
      query: {
        workspaceId: "ws-1",
        from: "2026-01-01",
        to: "2026-01-31",
        calendarView: "month",
        includeViewHint: true,
        monthCellVisibleLimit: 4,
        monthViewTimeZone: "America/Sao_Paulo",
      },
    });
  });

  it("omits optional query params when values are invalid or missing", async () => {
    const { api, request } = createApi({});

    const result = await api.listSchedulesWithMeta("ws-1", {
      includeViewHint: false,
      monthCellVisibleLimit: Number.POSITIVE_INFINITY,
    });

    expect(result).toEqual({ data: [], meta: undefined });
    expect(request.mock.calls[0][0].query).toEqual({
      workspaceId: "ws-1",
      includeViewHint: false,
    });
  });

  it("unwraps listSchedules from listSchedulesWithMeta", async () => {
    const { api } = createApi({ data: [{ id: "schedule-1" }] });

    await expect(api.listSchedules("ws-2", { from: "2026-01-01" })).resolves.toEqual([
      { id: "schedule-1" },
    ]);
  });

  it("sends limit in nextSchedules only when limit is numeric", async () => {
    const withLimit = createApi({ data: [{ id: "next-1" }] });
    const withoutLimit = createApi({ data: [{ id: "next-2" }] });

    await expect(withLimit.api.nextSchedules("ws-1", 5)).resolves.toEqual([{ id: "next-1" }]);
    await expect(withoutLimit.api.nextSchedules("ws-1")).resolves.toEqual([{ id: "next-2" }]);

    expect(withLimit.request.mock.calls[0][0].query).toEqual({ workspaceId: "ws-1", limit: 5 });
    expect(withoutLimit.request.mock.calls[0][0].query).toEqual({ workspaceId: "ws-1" });
  });

  it("handles create/update/delete/today/status requests", async () => {
    const create = createApi({ id: "created" });
    const update = createApi({ id: "updated" });
    const remove = createApi(undefined);
    const today = createApi({ data: [{ id: "today-1" }] });
    const statuses = createApi({ data: [{ id: "open", code: "open", label: "Open" }] });

    await expect(
      create.api.createSchedule({ start: "2026-02-10T10:00:00.000Z", end: "2026-02-10T11:00:00.000Z" })
    ).resolves.toEqual({ id: "created" });
    expect(create.request.mock.calls[0][0].method).toBe("POST");

    await expect(update.api.updateSchedule("schedule-1", { title: "Updated" })).resolves.toEqual({
      id: "updated",
    });
    expect(update.request.mock.calls[0][0].method).toBe("PATCH");

    await expect(remove.api.deleteSchedule("schedule-1")).resolves.toBeUndefined();
    expect(remove.request.mock.calls[0][0].method).toBe("DELETE");

    await expect(today.api.todaySchedules("ws-1")).resolves.toEqual([{ id: "today-1" }]);
    expect(today.request.mock.calls[0][0]).toMatchObject({
      method: "GET",
      url: "/schedule/internal/schedules/today",
      query: { workspaceId: "ws-1" },
    });

    await expect(statuses.api.getStatuses()).resolves.toEqual([
      { id: "open", code: "open", label: "Open" },
    ]);
    expect(statuses.request.mock.calls[0][0]).toMatchObject({
      method: "GET",
      url: "/schedule/internal/statuses",
    });
  });

  it("returns [] when list/next/today/status payloads are undefined", async () => {
    const listApi = createApi(undefined);
    const nextApi = createApi(undefined);
    const todayApi = createApi(undefined);
    const statusApi = createApi(undefined);

    await expect(listApi.api.listSchedules("ws-1")).resolves.toEqual([]);
    await expect(nextApi.api.nextSchedules("ws-1")).resolves.toEqual([]);
    await expect(todayApi.api.todaySchedules("ws-1")).resolves.toEqual([]);
    await expect(statusApi.api.getStatuses()).resolves.toEqual([]);
  });
});


