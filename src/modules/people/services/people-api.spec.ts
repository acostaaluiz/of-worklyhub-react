import type { HttpClient } from "@core/http/interfaces/http-client.interface";
import { PeopleApi } from "./people-api";

function createApi(response: DataValue) {
  const request = jest.fn().mockResolvedValue({ data: response });
  const http = { request } as unknown as HttpClient;
  const api = new PeopleApi(http);
  return { api, request };
}

describe("PeopleApi", () => {
  it("handles workers endpoints", async () => {
    const { api, request } = createApi([{ id: "emp-1" }]);

    await api.createWorker({
      workspace_id: "ws-1",
      user_email: "worker@worklyhub.com",
      user_name: "Worker One",
    });
    await api.updateWorker("ws-1", "uid-1", { job_title: "Dentist" });
    const workers = await api.listWorkspaceWorkers("ws-1");

    expect(Array.isArray(workers)).toBe(true);
    expect(request.mock.calls[0][0]).toMatchObject({
      method: "POST",
      url: "/people/workers",
    });
    expect(request.mock.calls[1][0]).toMatchObject({
      method: "PUT",
      url: "/people/workers/ws-1/uid-1",
    });
    expect(request.mock.calls[2][0]).toMatchObject({
      method: "GET",
      url: "/people/internal/workspaces/ws-1/workers",
    });
  });

  it("handles availability and capacity endpoints", async () => {
    const { api, request } = createApi({ blocks: [] });

    await api.getWorkerWeeklyAvailability("ws-1", "emp-1");
    await api.upsertWorkerWeeklyAvailability("ws-1", "emp-1", {
      minutesByWeekday: { "1": 480 },
      actorUid: "user-1",
    });
    await api.listAvailabilityBlocks("ws-1", { from: "2026-03-10" });
    await api.createAvailabilityBlock("ws-1", {
      employeeId: "emp-1",
      date: "2026-03-10",
      startTime: "09:00",
      endTime: "10:00",
    });
    await api.deleteAvailabilityBlock("ws-1", "block-1", { actorUid: "user-1" });
    await api.getWorkforceCapacity("ws-1", "2026-03-09");
    await api.getWorkforceCapacity("ws-1");

    expect(request.mock.calls[0][0].url).toBe(
      "/people/internal/workspaces/ws-1/workers/emp-1/weekly-availability"
    );
    expect(request.mock.calls[1][0].method).toBe("PUT");
    expect(request.mock.calls[2][0]).toMatchObject({
      method: "GET",
      url: "/people/internal/workspaces/ws-1/availability-blocks",
      query: { from: "2026-03-10" },
    });
    expect(request.mock.calls[5][0]).toMatchObject({
      method: "GET",
      url: "/people/internal/workspaces/ws-1/workforce-capacity",
      query: { weekStart: "2026-03-09" },
    });
    expect(request.mock.calls[6][0]).toMatchObject({
      method: "GET",
      url: "/people/internal/workspaces/ws-1/workforce-capacity",
      query: undefined,
    });
  });
});
