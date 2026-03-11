import type { HttpClient } from "@core/http/interfaces/http-client.interface";
import { GrowthApi } from "./growth-api";

function createApi(response: DataValue) {
  const request = jest.fn().mockResolvedValue({ data: response });
  const http = { request } as unknown as HttpClient;
  const api = new GrowthApi(http);
  return { api, request };
}

describe("GrowthApi", () => {
  it("lists opportunities with normalized query parameters", async () => {
    const { api, request } = createApi({
      items: [{ id: "o-1" }],
      pagination: { total: 1, limit: 20, offset: 0, hasMore: false },
    });

    const result = await api.listOpportunities({
      workspaceId: "ws-1",
      search: "reactivation",
      status: "new",
      from: "2026-02-01",
      to: "2026-02-28",
      limit: 20,
      offset: 0,
    });

    expect(result.items).toHaveLength(1);
    expect(request.mock.calls[0][0]).toMatchObject({
      method: "GET",
      url: "/growth/internal/opportunities",
      query: {
        workspaceId: "ws-1",
        search: "reactivation",
        status: "new",
        from: "2026-02-01",
        to: "2026-02-28",
        limit: 20,
        offset: 0,
      },
    });
  });

  it("gets attribution summary and playbooks", async () => {
    const summaryApi = createApi({
      workspaceId: "ws-1",
      dispatchedCount: 10,
      convertedCount: 2,
    });
    const playbooksApi = createApi({ items: [{ id: "pb-1" }] });

    const summary = await summaryApi.api.getAttributionSummary("ws-1", {
      from: "2026-02-01",
      to: "2026-02-28",
    });
    const playbooks = await playbooksApi.api.listPlaybooks("ws-1");

    expect(summary.dispatchedCount).toBe(10);
    expect(playbooks.items).toEqual([{ id: "pb-1" }]);
  });

  it("upserts playbooks and dispatches opportunities", async () => {
    const upsertApi = createApi({ playbooks: [{ id: "pb-1" }] });
    const dispatchApi = createApi({ dispatchedCount: 3 });

    const upsert = await upsertApi.api.upsertPlaybooks({
      workspaceId: "ws-1",
      actorUid: "user-1",
      playbooks: [],
    });
    const dispatch = await dispatchApi.api.dispatch({
      workspaceId: "ws-1",
      opportunityIds: ["o-1", "o-2"],
    });

    expect(upsert.playbooks).toEqual([{ id: "pb-1" }]);
    expect(dispatch.dispatchedCount).toBe(3);
    expect(upsertApi.request.mock.calls[0][0]).toMatchObject({
      method: "POST",
      url: "/growth/internal/playbooks",
    });
    expect(dispatchApi.request.mock.calls[0][0]).toMatchObject({
      method: "POST",
      url: "/growth/internal/dispatch",
    });
  });
});

